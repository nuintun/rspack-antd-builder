/**
 * @module number
 */

/**
 * @function formatThousands
 * @description 格式化数字
 * @param number 需要格式化的数字
 * @param precision 小数位保留个数
 */
export function formatThousands(number: number | string = 0, precision: number = 2): string {
  number = Number(number);

  const { Intl } = window;

  if (Intl) {
    return new Intl.NumberFormat('en-us', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(number);
  }

  const parts = number.toFixed(precision).split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}
