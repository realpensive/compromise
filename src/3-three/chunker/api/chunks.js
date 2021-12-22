const chunks = function (view) {
  let carry = []
  let roll = null
  let same = null
  view.docs.forEach(terms => {
    terms.forEach(term => {
      // start a new chunk
      if (term.chunk !== same) {
        if (roll) {
          roll[2] = term.index[1]
          carry.push(roll)
        }
        same = term.chunk
        roll = [term.index[0], term.index[1]]
      }
    })
  })
  if (roll) {
    carry.push(roll)
  }
  return view.update(carry)
}
export default chunks