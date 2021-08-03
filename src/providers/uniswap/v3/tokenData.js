import {formatTokenName, formatTokenSymbol} from "./../../../utils/tokens";
import {GraphQLClient} from "graphql-request";
import type {TokenData} from "../../../interfaces";

const TOKENS_QUERY = (
  block: null | number = null,
  tokens: string[] = [],
  orderBy: string | undefined = 'totalValueLockedUSD',
  orderDirection: string | undefined = 'desc') => {

  let tokenString = `[`
  tokens.map((address: string) => {
    return (tokenString += `"${address}",`)
  })
  tokenString += ']'
  return `{
      tokens(where: {id_in: ${tokenString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: ${orderBy}, orderDirection: ${orderDirection}) {
        id
        symbol
        name
        derivedETH
        totalSupply
        volume
        txCount
        totalValueLocked
      }
    }`
}

interface TokenFields {
  id: string,
  symbol: string,
  name: string,
  derivedETH: string,
  volumeUSD: string,
  volume: string,
  feesUSD: string,
  txCount: string,
  totalValueLocked: string,
  totalValueLockedUSD: string,
}


export const mapToken = function (token: TokenFields): TokenData {
  return {
    address: token.id,
    name: formatTokenName(token.id, token.name),  // 'Art Blocks Curated Full Set',
    symbol: formatTokenSymbol(token.id, token.symbol),  // 'ABC123',
    volume: parseFloat(token.volume),  // '13514.487363679039296109',
    txCount: parseFloat(token.txCount),  // '448',
    derivedETH: parseFloat(token.derivedETH),
    totalValueLocked: parseFloat(token.totalValueLocked),  // '2030.560502437830764385',
  }
}

/**
 *
 * @param client
 * @param tokenAddress
 * @param block
 * @param orderBy
 * @param orderDirection
 * @returns {Promise<TokenData|null>}
 */
export const fetchTokenData = async (client: GraphQLClient,
                                     tokenAddress: string,
                                     block: number | null = null,
                                     orderBy: string | undefined = 'totalValueLockedUSD',
                                     orderDirection: string | undefined = 'desc'): TokenData | null => {

  const query = TOKENS_QUERY(block = null,
    [tokenAddress],
    orderBy,
    orderDirection)
  try {
    const {tokens} = await client.request(query);
    if (tokens.length === 0) {
      return null
    }
    const token = tokens[0]
    return mapToken(token)
  } catch (e) {
    console.error(e)
    return null
  }
}

/**
 *
 * @param client
 * @param tokens
 * @param block
 * @param orderBy
 * @param orderDirection
 * @returns {Promise<*[]|*>}
 */
export const fetchTokensData = async (client: GraphQLClient,
                                      tokens: string[] = [],
                                      block: null | number | undefined = null,
                                      orderBy: string | undefined = 'totalValueLockedUSD',
                                      orderDirection: string | undefined = 'desc'): TokenData[] | any[] => {

  const query = TOKENS_QUERY(block = null,
    tokens,
    orderBy,
    orderDirection)

  try {
    const {tokens} = await client.request(query);
    if (tokens.length === 0) {
      return []
    }
    return tokens.map(token => mapToken(token))
  } catch (e) {
    console.error(e)
    return []
  }
}
