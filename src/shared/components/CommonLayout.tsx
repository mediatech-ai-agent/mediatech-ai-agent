import { Outlet } from 'react-router-dom';

const CommonLayout = () => {
  return (
    <div>
      layout
      <Outlet />
    </div>
  );
};

export default CommonLayout;
