fetch('http://localhost/nextjs/graphql', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({query: '{ pages { nodes { id title slug } } }'})
})
  .then((r) => r.json())
  .then((data) => console.info(JSON.stringify(data, null, 2)))
  .catch(console.error)
