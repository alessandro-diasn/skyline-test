/**
 * @module DOM Utils
 * @description Funções auxiliares para manipulação do DOM.
 */

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
