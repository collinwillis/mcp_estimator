import { useEffect, useState } from 'react';

import { getSingleWbs } from '../api/wbs';
import { Wbs } from '../models/wbs';

interface CurrentWbsProps {
  wbsId: string;
}
export const useCurrentWbs = ({ wbsId }: CurrentWbsProps) => {
  const [data, setData] = useState<Wbs>();

  useEffect(() => {
    const getData = async () => {
      const wbs = await getSingleWbs({ wbsId });
      setData(wbs);
    };

    if (wbsId != null && wbsId.length > 0) {
      getData();
    } else {
      setData(undefined);
    }
  }, [wbsId]);

  return data;
};
