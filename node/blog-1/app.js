const queryString = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const getPostData = (req) => {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }
    let postData;
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) {
        resolve({})
        return
      }
      resolve(JSON.parse(postData))
    })
  })
}

const serverHandle = (req, res) => {
  // 设置数据返回格式 JSON
  res.setHeader('Content-type', 'application/json')

  // 获取path
  const url = req.url
  req.path = url.split('?')[0]

  // 解析query
  req.query = queryString.parse(url.split('?')[0])
  console.log('req.query', req.query);

  // 处理post-data
  getPostData(req).then(postData => {
    req.body = postData
    // 处理blog路由
    const blogData = handleBlogRouter(req, res);
    if (blogData) {
      return res.end(JSON.stringify(blogData))
    }

    // 处理user路由
    const userData = handleUserRouter(req, res);
    if (userData) {
      return res.end(JSON.stringify(userData))
    }

    // 未命中路由，返回404
    res.writeHead(404, { "Content-type": "text/plain" })
    res.write("404 NOT FUND")
    res.end()
  })
}

module.exports = serverHandle