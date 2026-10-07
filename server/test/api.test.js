import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';

let server;
let baseUrl;
let tmpDir;
let dataFile;

before(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'taskboard-test-'));
  dataFile = path.join(tmpDir, 'db.json');
  const store = await createStore(dataFile);
  server = createApp(store).listen(0);
  await once(server, 'listening');
  baseUrl = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  server.closeAllConnections();
  server.close();
  await rm(tmpDir, { recursive: true, force: true });
});

async function call(method, url, body) {
  const res = await fetch(baseUrl + url, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

const titlesIn = (tasks, status) => tasks.filter((t) => t.status === status).map((t) => t.title);

test('tạo, đọc, sửa và xoá công việc', async () => {
  const created = await call('POST', '/tasks', { title: '  Học React  ', priority: 'high' });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Học React');
  assert.equal(created.body.status, 'todo');
  assert.equal(created.body.dueDate, null);

  const { id } = created.body;
  assert.equal((await call('GET', `/tasks/${id}`)).body.title, 'Học React');

  const updated = await call('PATCH', `/tasks/${id}`, { dueDate: '2026-12-31', status: 'doing' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.dueDate, '2026-12-31');
  assert.equal(updated.body.status, 'doing');

  assert.equal((await call('DELETE', `/tasks/${id}`)).status, 204);
  assert.equal((await call('GET', `/tasks/${id}`)).status, 404);
  assert.equal((await call('DELETE', `/tasks/${id}`)).status, 404);
});

test('từ chối dữ liệu không hợp lệ', async () => {
  assert.equal((await call('POST', '/tasks', { title: '   ' })).status, 400);
  assert.equal((await call('POST', '/tasks', { title: 'A', priority: 'urgent' })).status, 400);
  assert.equal((await call('POST', '/tasks', { title: 'A', dueDate: '2026-02-30' })).status, 400);
  assert.equal((await call('POST', '/tasks', ['không phải object'])).status, 400);

  const res = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ json hỏng',
  });
  assert.equal(res.status, 400);

  const { body } = await call('POST', '/tasks', { title: 'A' });
  assert.equal((await call('PATCH', `/tasks/${body.id}`, {})).status, 400);
  assert.equal((await call('POST', `/tasks/${body.id}/move`, { status: 'done', index: -1 })).status, 400);
  await call('DELETE', `/tasks/${body.id}`);
});

test('kéo thả: di chuyển trong cột và sang cột khác', async () => {
  const ids = {};
  for (const title of ['A', 'B', 'C']) {
    ids[title] = (await call('POST', '/tasks', { title })).body.id;
  }

  // Đưa C lên đầu cột "todo"
  let { body: tasks } = await call('POST', `/tasks/${ids.C}/move`, { status: 'todo', index: 0 });
  assert.deepEqual(titlesIn(tasks, 'todo'), ['C', 'A', 'B']);

  // Chuyển A sang cột "done"; index lớn hơn số phần tử → nằm cuối cột
  ({ body: tasks } = await call('POST', `/tasks/${ids.A}/move`, { status: 'done', index: 99 }));
  assert.deepEqual(titlesIn(tasks, 'todo'), ['C', 'B']);
  assert.deepEqual(titlesIn(tasks, 'done'), ['A']);
  assert.deepEqual(
    tasks.filter((t) => t.status === 'todo').map((t) => t.order),
    [0, 1],
  );

  // Dữ liệu được lưu xuống file: mở lại kho từ cùng file vẫn còn nguyên
  const reopened = await createStore(dataFile);
  assert.deepEqual(titlesIn(reopened.list(), 'todo'), ['C', 'B']);

  assert.equal((await call('POST', '/tasks/khong-ton-tai/move', { status: 'done', index: 0 })).status, 404);
});

test('API không tồn tại trả về 404 dạng JSON', async () => {
  const { status, body } = await call('GET', '/khong-co');
  assert.equal(status, 404);
  assert.ok(body.error);
});
