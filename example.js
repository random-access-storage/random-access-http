var raHttp = require('./')

var file = raHttp('/readme.md', { url: 'https://raw.githubusercontent.com/e-e-e/http-random-access/master/' })

file.read(2, 10, (err, data) => {
  if (err) {
    console.log('Something went wrong!')
    console.log(err)
    return
  }
  console.log(data.toString())
})
