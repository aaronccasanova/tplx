export interface Delimiters {
  open?: string
  close?: string
}

export interface Options {
  strict?: boolean
  delimiters?: Delimiters
}

export type Inputs = string[]

export type Values = {
  [input: string]: any
}

export interface Template {
  content: string
  inputs: Inputs
  options: Options
}

export declare function format(
  tpl: string,
  values: Values,
  options?: Options,
): string

export declare function getInputs(tpl: string, delimiters?: Delimiters): Inputs

export declare function read(
  templateFileName: string,
  options?: Options,
): Promise<Template>

export declare function readSync(
  templateFileName: string,
  options?: Options,
): Template
