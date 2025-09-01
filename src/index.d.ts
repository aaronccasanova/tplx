export interface Delimiters {
  open?: string
  close?: string
}

export type Inputs = string[]

export type Values = {
  [input: string]: any
}

export declare function render(
  tpl: string,
  values: Values,
  options?: {
    strict?: boolean
    delimiters?: Delimiters
  },
): string

export declare function getInputs(tpl: string, delimiters?: Delimiters): Inputs
