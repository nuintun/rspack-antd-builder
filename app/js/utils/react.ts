/**
 * @module  react
 */

/**
 * @function createMarkup
 * @description 生成 React HTML 字符串
 * @param html HTML 字符串
 */
export function createMarkup(html: string): { __html: string } {
  return { __html: html };
}

export function unblockKeyboard(event: React.KeyboardEvent<HTMLFormElement>): void {
  event.stopPropagation();
}
