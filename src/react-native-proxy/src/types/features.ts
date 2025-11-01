type AllFeaturesType = (featureType | GoogleFeatureType)[]

interface featureType {
    id: string,
    urlLink: string,
    text: string
}

interface GoogleFeatureType extends featureType {
    ios_client_id?: string
}

interface OTPFeatureType extends featureType {
    widget_id?: string,
    token_auth?: string,
    service_id?: number,
    icon?: string
}

export type {
    AllFeaturesType,
    featureType,
    GoogleFeatureType,
    OTPFeatureType
}