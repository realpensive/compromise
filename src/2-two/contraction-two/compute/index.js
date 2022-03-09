import splice from './_splice.js'
import apostropheS from './apostrophe-s.js'
import apostropheD from './apostrophe-d.js'
import apostropheT from './apostrophe-t.js'
import isPossessive from './isPossessive.js'

const byApostrophe = /'/

// run tagger on our new implicit terms
const reTag = function (terms, view) {
  let tmp = view.update()
  tmp.document = [terms]
  tmp.compute(['lexicon', 'preTagger', 'index'])
}

const byEnd = {
  // how'd
  d: (terms, i) => apostropheD(terms, i),
  // we ain't
  t: (terms, i) => apostropheT(terms, i),
  // bob's
  s: (terms, i, world) => {
    // [bob's house] vs [bob's cool]
    if (isPossessive(terms, i)) {
      world.methods.one.setTag([terms[i]], 'Possessive', world)
    } else {
      apostropheS(terms, i)
    }
  },
}

const toDocs = function (words, view) {
  return view.fromText(words.join(' ')).docs[0]
}

//really easy ones
const contractions = (view) => {
  let { world, document } = view
  // each sentence
  document.forEach((terms, n) => {
    // loop through terms backwards
    for (let i = terms.length - 1; i >= 0; i -= 1) {
      // is it already a contraction
      if (terms[i].implicit) {
        return
      }
      let after = null
      if (byApostrophe.test(terms[i].normal) === true) {
        [, after] = terms[i].normal.split(byApostrophe)
      }
      let words = null
      // any known-ones, like 'dunno'?
      // ['foo', 's']
      if (byEnd.hasOwnProperty(after)) {
        words = byEnd[after](terms, i, world)
      }
      // actually insert the new terms
      if (words) {
        words = toDocs(words, view)
        splice(document, [n, i], words)
        reTag(document[n], view)
        continue
      }
    }
  })
}
export default contractions