// export const ENTRYPOINT = process.env.REACT_APP_ENTRYPOINT
const host = window.location.hostname
export const ENTRYPOINT = `http://${host}:4444/api/v1`
export const THUMB = `http://${host}:4444/api/v1/thumb`
export const IMAGE = `http://${host}:4444`
