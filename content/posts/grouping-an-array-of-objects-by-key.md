---
title: Grouping an array of objects by key
date: 2019-07-25
published: true
tags: ['Javascript', 'Functional Programming']
canonical_url: false
description: 'With the help of array.reduce, the Map data structure and higher-order functions you can do a lot in JavaScript, for example a generic groupBy function for an array of objects.'
---

We are going to implement a groupBy function, which when given a collection and a key returns a new `Map()` grouped by that key.

For example given this input:

```js
const blogPosts = [
  { category: 'javascript', author: 'Alex', title: 'Usecases for reduce' },
  { category: 'php', author: 'Alex', title: 'Getting started with phpunit' },
  { category: 'javascript', author: 'Ben', title: 'Maps and Sets' },
]

const blogPostsByCategory = ???

blogPostsByCategory.forEach(category => console.table(category))
```

It should produce this output (`console.table()` is a hidden gem):

```sh
┌─────────┬──────────────┬────────┬───────────────────────┐
│ (index) │   category   │ author │         title         │
├─────────┼──────────────┼────────┼───────────────────────┤
│    0    │ 'javascript' │ 'Alex' │ 'Usecases for reduce' │
│    1    │ 'javascript' │ 'Ben'  │    'Maps and Sets'    │
└─────────┴──────────────┴────────┴───────────────────────┘
┌─────────┬──────────┬────────┬────────────────────────────────┐
│ (index) │ category │ author │             title              │
├─────────┼──────────┼────────┼────────────────────────────────┤
│    0    │  'php'   │ 'Alex' │ 'Getting started with phpunit' │
└─────────┴──────────┴────────┴────────────────────────────────┘
```

We are going to do this step by step, starting with the `reduce()` method, diving quickly into higher-order functions, then examining the `Map` data structure. Finally, we put everything together for our `groupBy` function!

## `reduce()`

The `reduce()` method takes an array and combines it into a single value. It does that by executing a **reducer function** and **accumulating the result**.

The most common example is summing all the numbers in an array.

```js
const numbers = [1, 2, 3]

const add = (a, b) => a + b

const sumOfNumbers = numbers.reduce(add)

console.log(sumOfNumbers)
```

```sh
6
```

## Higher-Order Functions

Higher Order Functions are functions, that can return a function or take a function as an argument. `map()`, `reduce()` and `filter()` are higher-order functions.

### Currying

Curried functions are functions that return a function which takes **one** argument.

```js
const addCurried = a => b => a + b

//    add2 is a function, which takes exactly one argument now
const add2 = addCurried(2)
//    addCurried = a => b => a + b
//    add2 =       2 => b => 2 + b
//    add2 =            b => 2 + b

const sumOfnumbersPlus2 = numbers.map(add2).reduce(add)

console.log(sumOfnumbersPlus2)
```

```sh
12
```

## `Map<Key,Value>`

A `Map` is an object which maps a given key to a value. The key can be anything, a `String`, a `Number` or even an `Object`. The same is true for the value: It could also be an `Array`, which will become important later.

When iterating over a map, the order is the **insertion order** of the values.

### A Map of names starting with a certain character

```js
const namesStartingWithA = ['Alex', 'Adrian']
const namesStartingWithB = ['Ben']
const namesStartingWithC = ['Charlie', 'Carl']

const nameMap = new Map([
  ['A', namesStartingWithA],
  ['B', namesStartingWithB],
  ['C', namesStartingWithC],
])

console.table(nameMap)
```

```sh
┌───────────────────┬─────┬───────────────────────┐
│ (iteration index) │ Key │        Values         │
├───────────────────┼─────┼───────────────────────┤
│         0         │ 'A' │ [ 'Alex', 'Adrian' ]  │
│         1         │ 'B' │       [ 'Ben' ]       │
│         2         │ 'C' │ [ 'Charlie', 'Carl' ] │
└───────────────────┴─────┴───────────────────────┘
```

#### Retrieving only the names starting with "A"

We use `map.get(key)` to do that.

```js
console.log(nameMap.get('A'))
```

```sh
[ 'Alex', 'Adrian' ]
```

#### Adding a new name

We use `map.set(newValue)` to set a new value for that key.

We have to create a new array, where our new name is added to the old names. We set this new array as our value for the key.

```js
nameMap.set('A', [...namesStartingWithA, 'Alf'])
console.log(nameMap.get('A'))
```

```sh
[ 'Alex', 'Adrian', 'Alf' ]
```

#### Creating a helper function to append values to an array

Getting the array via `map.get()` can get tedious after a while. Luckily we can create a higher-order function, which helps to append a value to an existing array for that key, or if it doesn't exist, creating a new one.

We concatenate the old array with the new value [using the spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

```js
// Higher order function, fn(map) -> fn(key) -> fn(value)
const appendValueToArray = map => key => value => {
  // if the map has that key, use that value as array, if not create a new one
  const currentValues = map.get(key) || []

  return map.set(key, [...currentValues, value])
}

appendValueToArray(nameMap)('A')('Albert')
console.log(nameMap.get('A'))
```

```sh
[ 'Alex', 'Adrian', 'Alf', 'Albert' ]
```

## Grouping blogposts by their category

We now have all our tools needed to create a reduce function, which can group our blogposts by their category. Let's get started by "creating" some blog posts.

```js
const blogPosts = [
  { category: 'javascript', author: 'Alex', title: 'Usecases for reduce' },
  { category: 'php', author: 'Alex', title: 'Getting started with phpunit' },
  { category: 'javascript', author: 'Ben', title: 'Maps and Sets' },
]
```

First, we create our reducer function, making use of our `appendValueToArray()` method. We get the category of the blog post by doing a [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring).

```js
// returns the map with our new value appended for the array of the category key
const groupByCategory = (blogPostCategoryMap, blogPost) => {
  const { category } = blogPost
  const addBlogPostsToCategory = appendValueToArray(blogPostCategoryMap)

  return addBlogPostsToCategory(category)(blogPost)
}
```

Now the missing `reduce()` call to get our blog post by category is just a cute little line. Note that we have to provide our initial value for our reducer of an empty `new Map()`.

```js
const blogPostsByCategory = blogPosts.reduce(groupByCategory, new Map())
```

We can then iterate with `map.forEach(value, key)` over the map to get a pretty output of `blogPostsByCategory`.

```js
blogPostsByCategory.forEach((posts, category) => {
  console.log(`Category: ${category}`)
  console.table(posts)
})
```

```sh
Category: javascript
┌─────────┬──────────────┬────────┬───────────────────────┐
│ (index) │   category   │ author │         title         │
├─────────┼──────────────┼────────┼───────────────────────┤
│    0    │ 'javascript' │ 'Alex' │ 'Usecases for reduce' │
│    1    │ 'javascript' │ 'Ben'  │    'Maps and Sets'    │
└─────────┴──────────────┴────────┴───────────────────────┘
Category: php
┌─────────┬──────────┬────────┬────────────────────────────────┐
│ (index) │ category │ author │             title              │
├─────────┼──────────┼────────┼────────────────────────────────┤
│    0    │  'php'   │ 'Alex' │ 'Getting started with phpunit' │
└─────────┴──────────┴────────┴────────────────────────────────┘
```

## Implementing a generic `groupBy(key)`

We can further generalize this by implementing a generic groupBy method, which groups by any given key.

```js
const groupByKey = key => (mapGroupedByKey, entry) => {
  const addEntryToKey = appendValueToArray(mapGroupedByKey)(entry[key])
  return addEntryToKey(entry)
}

const groupedByKey = (array, key) => array.reduce(groupByKey(key), new Map())

const blogPostsByKey = key => groupedByKey(blogPosts, key)

const blogPostsByAuthor = blogPostsByKey('author')

const blogPostsByCategoryNew = blogPostsByKey('category')

blogPostsByAuthor.forEach(posts => console.table(posts))
```

```sh
┌─────────┬──────────────┬────────┬────────────────────────────────┐
│ (index) │   category   │ author │             title              │
├─────────┼──────────────┼────────┼────────────────────────────────┤
│    0    │ 'javascript' │ 'Alex' │     'Usecases for reduce'      │
│    1    │    'php'     │ 'Alex' │ 'Getting started with phpunit' │
└─────────┴──────────────┴────────┴────────────────────────────────┘
┌─────────┬──────────────┬────────┬─────────────────┐
│ (index) │   category   │ author │      title      │
├─────────┼──────────────┼────────┼─────────────────┤
│    0    │ 'javascript' │ 'Ben'  │ 'Maps and Sets' │
└─────────┴──────────────┴────────┴─────────────────┘
```

Don't worry if you struggle to wrap around your head around these concepts, it takes some time. But they can be incredibly powerful for working with data in a declarative manner.

```js
const amountOfBlogPostsByAuthor = author => blogPostsByAuthor.get(author).length

const alexBlogPostsCount = amountOfBlogPostsByAuthor('Alex')

console.log(alexBlogPostsCount)
```

```sh
2
```

## Conclusion

In this guide we learned how to utilize `array.reduce()`, `Map` and higher-order functions to create a fairly flexible method for grouping objects in an array by some key.

Do you have improvements or another neat idea? Let me know!

You can also find me on [Twitter as @jvstudnitz](https://twitter.com/jvstudnitz) or on [my blog](https://studnitz.dev/).
