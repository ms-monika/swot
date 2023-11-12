require('dotenv').config()
const request = require('request-promise')
const btoaVar = require('btoa')
const { ISSUER, CLIENT_ID, CLIENT_SECRET } = process.env


export async function getAccessToken(ISSUERVal: any,headerVal: any, formVal: any): Promise<any> {
    //const token = btoaVar(`${CLIENT_ID}:${CLIENT_SECRET}`)
    try {
        const response = await request({
            uri: `${ISSUERVal}`,
            json: true,
            method: 'POST',
            headers: headerVal,
            form: formVal,
        })
        //console.log(token_type)
        //console.log(access_token)
        return response
    } catch (error: any) {
        console.log(`Error v: ${error.message}`)
        throw error
    }
}

export async function verifyTokenUSingOkta(access_token: string, server_url?: string): Promise<Boolean> {
    const OktaJwtVerifier = require('@okta/jwt-verifier')
    const oktaJwtVerifier = new OktaJwtVerifier({
        issuer: server_url != undefined ? server_url : process.env.ISSUER,
        clientId: process.env.TEST_CLIENT_ID,
        jwksUri: `${ISSUER}/v1/keys`
    })
    try {
        await oktaJwtVerifier.verifyAccessToken(access_token)
        console.log('Token is verified')
        return true
    } catch (error: any) {
        console.log({ error: error.message })
        throw error
    }
}

export async function verifyTokenUsingIntrospect(access_token: string): Promise<Boolean> {
    const token = btoaVar(`${CLIENT_ID}:${CLIENT_SECRET}`)
    try {
        await request({
            uri: `${ISSUER}/v1/introspect`,
            json: true,
            method: 'POST',
            headers: {
                authorization: `Basic ${token}`,
            },
            form: {
                token: access_token,
                token_type_hint: 'access_token',
            },
        })
        //console.log(val)
        return true
    } catch (error: any) {
        console.log(`Error intro: ${error.message}`)
        throw error
    }
}

//test()

