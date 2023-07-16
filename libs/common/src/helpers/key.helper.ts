import ShortUniqueId from 'short-unique-id'

export const optionItemKeyLength = 6
const optionItemKeyUid = new ShortUniqueId({ length: optionItemKeyLength })
optionItemKeyUid.setDictionary('alpha_lower')

const s3KeyUid = new ShortUniqueId({ length: 8 })
s3KeyUid.setDictionary('number')

const orderKeyUid = new ShortUniqueId({ length: 8 })
orderKeyUid.setDictionary('alphanum_upper')

export { optionItemKeyUid, s3KeyUid, orderKeyUid }
