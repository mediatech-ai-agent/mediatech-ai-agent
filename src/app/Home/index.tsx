import { BgMenuFull } from '../../components/BgMenuFull';

const Home = () => {
  return (
    <div className="flex min-h-screen">
      {/* 좌측 메뉴 */}
      <div className="fixed top-10 z-10 left-15">
        <BgMenuFull width={280} height={1000}>
        </BgMenuFull>
      </div>
    </div>
  );
};

export default Home;
