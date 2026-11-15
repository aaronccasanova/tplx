import codeReviewTemplate from './code-review.tplx'

const formattedCodeReview = codeReviewTemplate.format({
  language: 'JavaScript',
  code: 'const greeting = "Hello, world!"',
})

console.log(formattedCodeReview)
