import { PRIORITIES, STATUSES } from './constants.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Loại các ngày không tồn tại như 2026-02-30
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Kiểm tra dữ liệu công việc gửi lên.
 * `partial: true` khi cập nhật — chỉ kiểm tra những trường được gửi.
 * Trả về { value, errors }; `value` chỉ chứa các trường hợp lệ đã chuẩn hoá.
 */
export function validateTask(body, { partial = false } = {}) {
  if (!isObject(body)) {
    return { value: {}, errors: ['Dữ liệu gửi lên phải là một object JSON'] };
  }

  const value = {};
  const errors = [];

  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) errors.push('Tiêu đề không được để trống');
    else if (title.length > 120) errors.push('Tiêu đề tối đa 120 ký tự');
    else value.title = title;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') errors.push('Mô tả phải là chuỗi');
    else if (body.description.length > 2000) errors.push('Mô tả tối đa 2000 ký tự');
    else value.description = body.description.trim();
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      errors.push(`Độ ưu tiên phải là một trong: ${PRIORITIES.join(', ')}`);
    } else value.priority = body.priority;
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      errors.push(`Trạng thái phải là một trong: ${STATUSES.join(', ')}`);
    } else value.status = body.status;
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') value.dueDate = null;
    else if (!isValidDate(body.dueDate)) errors.push('Hạn chót phải có dạng YYYY-MM-DD');
    else value.dueDate = body.dueDate;
  }

  if (partial && errors.length === 0 && Object.keys(value).length === 0) {
    errors.push('Không có trường nào để cập nhật');
  }

  return { value, errors };
}

export function validateMove(body) {
  const { status, index } = isObject(body) ? body : {};
  const errors = [];
  if (!STATUSES.includes(status)) {
    errors.push(`Trạng thái phải là một trong: ${STATUSES.join(', ')}`);
  }
  if (!Number.isInteger(index) || index < 0) {
    errors.push('Vị trí (index) phải là số nguyên không âm');
  }
  return { value: { status, index }, errors };
}
