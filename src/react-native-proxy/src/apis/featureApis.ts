import axios from 'axios';

export class FeatureApis {
    static async getFeatureList(referenceid: string) {
        const data = await axios.post(
            `https://routes.msg91.com/api/${referenceid}/widget?source=mobileSDK`
        )
        console.log('features list---------',JSON.stringify(data))
        return data.data?.data
        // const dummyFeatureData = {
        //     "data": [
        //         {
        //             "service_id": 7,
        //             "text": "Continue with Google",
        //             "icon": "https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/google.svg",
        //             "state": "TnFSRlFBTWVqeUpOM3A2ckhHK0oyTXdOcm40K3MrTXZMSGQ0WG0vZUo4M1JyRUh5SmtabklrWXNzSTNacVNBdURQR2FvOWl0TDd6cCtJdmhzelRwdnFZVVFZSjUvY2szY3dZMHJmNFNENkZEV1Z5aElBb2wrSklrZnQ0S2hCa0FnVlJJcVBIUGxhc3pkQ2FFUXd0eFpTejcxSEdnaHYwR3dOdjNVZGVSYm5aSVJpOGxScnllcHlNbE5rdXlwNFU2bTJRTm16MktVUHU1b1FIdytWdGlEOHBoNy8yV3d1UTNZV3c4TUZYYUI3VT0=",
        //             "client_id": "749256141371-v5ptgm2q3ltk1l57s13u81ilk8q3b0t3.apps.googleusercontent.com"
        //         },
        //         {
        //             "service_id": 6,
        //             "widget_id": "346766684b75303834353339",
        //             "token_auth": "424920T6pVvkrUk7BU66890206P1",
        //             "callbackUrl": "https://routes.msg91.com/api/auth/callback",
        //             "state": "TnFSRlFBTWVqeUpOM3A2ckhHK0oyTXdOcm40K3MrTXZMSGQ0WG0vZUo4M1JyRUh5SmtabklrWXNzSTNacVNBdURQR2FvOWl0TDd6cCtJdmhzelRwdnFZVVFZSjUvY2szY3dZMHJmNFNENkZKVDdrN2hsdzB4azFvM1UxMUZNSnk2dTVYR0tPQ3NNeG5EM1RUM2NjcE5zYkxDZ2ZVTlh2MTR5WDYwVFBwcU5sdFJGdzRXU2FmMVJ5NHV5cWpJUG9WdVlKallnOXZYaWFJSXQxb1VtYzQzcForZk5JSFduQzBYbnhEeVV0eDNmRT0=",
        //             "text": "Login With OTP",
        //             "icon": "https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/msg91.svg"
        //         },
        //         // {
        //         //     "service_id": 8,
        //         //     "text": "Continue with Apple",
        //         //     "icon": "https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/applelogo.png",
        //         //     "state": "TnFSRlFBTWVqeUpOM3A2ckhHK0oyTXdOcm40K3MrTXZMSGQ0WG0vZUo4M1JyRUh5SmtabklrWXNzSTNacVNBdURQR2FvOWl0TDd6cCtJdmhzelRwdnFZVVFZSjUvY2szY3dZMHJmNFNENkhsZ2YxKzhDdWxzWHFnZnc4MzAya1FnNU1WUTVrMG41bFo1NHJjUUtsbFVkL1FOWlJFZnVacHdVeXpyQzlFSGhVNVRUaGJZakNwQ0ZLRzEwN1BhNmd3RURtaDlZeEVWQkJaQXVJam5ydk56bHlTRFczaXEzWlpzWVkzSlJKWGxEUT0=",
        //         //     "client_id": "com.proxy.msg91"
        //         // },
        //         // {
        //         //     "service_id": 9,
        //         //     "state": "TnFSRlFBTWVqeUpOM3A2ckhHK0oyTXdOcm40K3MrTXZMSGQ0WG0vZUo4M1JyRUh5SmtabklrWXNzSTNacVNBdURQR2FvOWl0TDd6cCtJdmhzelRwdnFZVVFZSjUvY2szY3dZMHJmNFNENkgzbHJxTE9TZUpJMUtRUWxOMzlLQ0EwT1VzdUVHd1BWVkt2Z2Rzd3VBcUpTaFVRMnRSOTRSNlMxTWNYRVRZSzBEczJCU0JuQlV3L2o0NjRnZm1uUisxVFc2bjd4UVQycXFqd0xiaG5PbjBHU1BtUDVLMzJyNTVQM1VzNnFkK2lVTT0=",
        //         //     "text": "Continue with Password",
        //         //     "icon": "https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/passwordlogo.png"
        //         // }
        //     ],
        //     "status": "success",
        //     "hasError": false,
        //     "errors": [],
        //     "proxy_duration": 20
        // };

    //     console.log('features list--------- (DUMMY DATA)', JSON.stringify(dummyFeatureData));
    //     return dummyFeatureData.data;
    // }
    }
    static async getProxyAuthTokenForGoogleAuth(state: string, idToken: string) {
        try {
            const data = await axios.post(
                `https://routes.msg91.com/api/auth/callback?source=mobileSDK&state=${state}&accessToken=${idToken}`
            )
            console.log(data,'data in google')
            return data.data
        } catch (e)   {
            console.log(e.message,'error in google')
            throw e
        }
    }
    static async getProxyAuthTokenForAppleAuth(state: string, idToken: string, authorizationCode: string) {
        try {
            console.log(authorizationCode,"code")
            const data = await axios.post(
                `https://routes.msg91.com/api/auth/callback?source=mobileSDK&state=${state}&accessToken=${idToken}&id_token=${idToken}&code=${authorizationCode}`
            )
            console.log(data,"data")
            return data.data
        } catch (e) {
            console.log(e,"error")
            throw e

        }
    }
    static async getProxyAuthTokenForOTPAuth(state: string, jwtToken: string) {
        try {
         console.log("state",state)
         console.log(jwtToken)
            const data = await axios.post(
                `https://routes.msg91.com/api/auth/callback?source=mobileSDK&state=${state}&code=${jwtToken}`
            )
            console.log(data,"data")
            return data.data
        } catch (e) {
            throw e
        }
    }
}