async function test() {
  const query = `
    query TestOffset {
      posts(where: { offset: 1 }) {
        nodes {
          title
        }
      }
    }
  `
  try {
    const response = await fetch('http://localhost/nextjs/graphql', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query})
    })
    const data = await response.json()
    console.log(JSON.stringify(data, null, 2))
  } catch (e) {
    console.error(e)
  }
}

test()
