import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

let refreshPromise = null

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const isRefreshRequest = originalRequest?.url?.includes('/user/refresh-token')
        const status = error?.response?.status

        if (!originalRequest || isRefreshRequest || originalRequest._retry || status !== 401) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            if (!refreshPromise) {
                refreshPromise = axios.post(
                    `${import.meta.env.VITE_API_URL}/user/refresh-token`,
                    {},
                    { withCredentials: true }
                ).finally(() => {
                    refreshPromise = null
                })
            }

            await refreshPromise
            return axiosInstance(originalRequest)
        } catch (refreshError) {
            return Promise.reject(refreshError)
        }
    }
)

export default axiosInstance; 
