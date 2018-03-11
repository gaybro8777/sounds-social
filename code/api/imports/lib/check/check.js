import { check as meteorCheck, Match } from 'meteor/check'

export const check = (match = s => s) => structure => data =>
  meteorCheck(data, match(structure))

export const checkRequired = check()
export const checkMaybe = check(Match.Maybe)
