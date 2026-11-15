export interface Delimiters {
  open?: string
  close?: string
}

export interface Options {
  title?: string
  description?: string
  strict?: boolean
  delimiters?: Delimiters
}

export type Inputs = string[]

export interface Values {
  [input: string]: any
}

export interface Template {
  content: string
  inputs: Inputs
  options: Options
}

export declare function format(
  templateContent: string,
  values: Values,
  options?: Options,
): string

export declare function getInputs(
  templateContent: string,
  delimiters?: Delimiters,
): Inputs

export declare function parseTemplate(
  templateFileContent: string,
  options?: Options,
): Template

export declare function read(
  templateFileName: string,
  options?: Options,
): Promise<Template>

export declare function readSync(
  templateFileName: string,
  options?: Options,
): Template
