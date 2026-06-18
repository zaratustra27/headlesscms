async function countPosts() {
  const query = `
    query CountPosts {
      posts(where: {status: PUBLISH}, first: 500) {
        nodes {
          id
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
    if (data.errors) {
      console.log('Errors:', JSON.stringify(data.errors, null, 2))
    }
    if (data.data && data.data.posts) {
      console.log('Total posts nodes length:', data.data.posts.nodes.length)
    } else {
      console.log('No posts data found:', JSON.stringify(data, null, 2))
    }
  } catch (e) {
    console.error(e)
  }
}

countPosts()
