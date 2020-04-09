export function resolveAfter(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, ms)
  })
}

export function decodeHTMLEntities(text) {
  var textArea = document.createElement('textarea')
  textArea.innerHTML = text
  return textArea.value
}
