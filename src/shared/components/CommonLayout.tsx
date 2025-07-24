import { Outlet } from 'react-router-dom';

const CommonLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default CommonLayout;
