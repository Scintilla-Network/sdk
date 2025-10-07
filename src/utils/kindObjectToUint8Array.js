function kindObjectToUint8Array(data) {
    if(Array.isArray(data)) {
        throw new Error('Array is not supported');
    }

    if(!data.kind){
        throw new Error('Object has no kind');
    }

    if(data.toUint8Array){
        return data.toUint8Array();
    }
}

export { kindObjectToUint8Array };
export default kindObjectToUint8Array;