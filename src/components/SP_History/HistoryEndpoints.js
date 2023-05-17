import {useQuery} from 'react-query';
import axios from 'axios';

const setHeader = async () => {
    await Auth.refreshAccessToken();
    axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(localStorage.getItem('user')).accessToken}`;
}

export const useGetAllAccounts = async (startDate,endDate) => {
      await setHeader();
      return useQuery(['getSalesData'],
        () => axios.get(`http://ec2-54-160-159-162.compute-1.amazonaws.com:8080/api/user/3/saleentry/${startDate}/${moment(endDate).add(1,'days').format('YYYY-MM-DD')}`),
        {refetchOnWindowFocus: false}
    );
};

