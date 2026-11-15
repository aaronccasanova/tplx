import { format as formatCodeReview } from './code-review.tplx'

const formattedCodeReview = formatCodeReview({
  language: 'JavaScript',
  code: 'const greeting = "Hello, world!"',
})

console.log(formattedCodeReview)
