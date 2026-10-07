import assert from 'node:assert/strict'
import { test } from 'node:test'
import { recipeImageProps, recipeThumbnail, RECIPE_IMAGE_FALLBACK } from './recipeImages.js'

test('resizes Cloudinary images and negotiates format and quality without changing the asset id', () => {
  const source = 'https://res.cloudinary.com/demo/image/upload/v123/folder/meal.jpg'
  assert.equal(recipeThumbnail(source, 640), 'https://res.cloudinary.com/demo/image/upload/c_limit,w_640/f_auto,q_auto/v123/folder/meal.jpg')
  const props = recipeImageProps(source)
  assert.match(props.srcSet, /w_320.* 320w/)
  assert.match(props.srcSet, /w_1280.* 1280w/)
  assert.ok(props.sizes)
})

test('reduces Unsplash width while retaining existing crop and attribution parameters', () => {
  const url = new URL(recipeThumbnail('https://images.unsplash.com/photo-test?w=2400&fit=crop&ixid=credit', 480))
  assert.equal(url.searchParams.get('w'), '480')
  assert.equal(url.searchParams.get('fit'), 'crop')
  assert.equal(url.searchParams.get('ixid'), 'credit')
  assert.equal(url.searchParams.get('auto'), 'format')
})

test('does not rewrite signed Cloudinary URLs, other providers, or relative URLs', () => {
  for (const source of ['https://res.cloudinary.com/demo/image/upload/s--signature--/v1/meal.jpg', 'https://res.cloudinary.com/demo/image/upload/meal.jpg?token=signed', 'https://example.com/meal.jpg', '/images/meal.jpg']) {
    assert.equal(recipeImageProps(source).src, source)
    assert.equal(recipeImageProps(source).srcSet, undefined)
  }
})

test('missing images use a local placeholder without an external request', () => {
  assert.equal(recipeImageProps(null).src, RECIPE_IMAGE_FALLBACK)
  assert.equal(recipeImageProps('').srcSet, undefined)
})
