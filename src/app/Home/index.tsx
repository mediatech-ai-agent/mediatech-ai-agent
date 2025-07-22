import React from 'react';
import { SideMenu } from '@/shared/components/sideMenu';
import { ICON_PATH } from '@/shared/constants';

const Home = () => {
  const handleMenuClick = (id: string) => {
    console.log('Menu clicked:', id);
  };

  const handleHistoryClick = (id: string) => {
    console.log('History clicked:', id);
  };

  // TODO: store 이관
  const menuHeaderItems = [
    {
      id: 'new-chat',
      title: '새로운 대화하기',
      icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
    },
  ];

  // TODO: store 이관
     const menuItems = [
     {
       id: 'jira',
       title: 'Jira 요약하기',
       icon: ICON_PATH.SIDE_MENU.JIRA,
     },
     {
       id: 'cr',
       title: 'CR 생성하기',
       icon: ICON_PATH.SIDE_MENU.CR,
     },
     {
       id: 'policy',
       title: '정책 문의하기',
       icon: ICON_PATH.SIDE_MENU.POLICY,
     },
     {
       id: 'person',
       title: '담당자 찾기',
       icon: ICON_PATH.SIDE_MENU.PERSON,
     },
   ];

   // TODO: store 이관 및 local storage 저장을 위한 로직 추가
     const historyItems = [
     {
       id: 'history-1',
       title: '일반 질문에 대한 요약',
       icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
     },
     {
       id: 'history-2',
       title: 'Jira 요약하기',
       icon: ICON_PATH.SIDE_MENU.JIRA,
     },
     {
       id: 'history-3',
       title: 'CR 생성하기',
       icon: ICON_PATH.SIDE_MENU.CR,
     },
     {
       id: 'history-4',
       title: '정책 문의하기',
       icon: ICON_PATH.SIDE_MENU.POLICY,
     },
     {
       id: 'history-5',
       title: '담당자 찾기',
       icon: ICON_PATH.SIDE_MENU.PERSON,
     },
   ]


  return (
    <div>
      <section className="left-side-menu w-[280px] h-[810px] flex-col items-center">
                 <SideMenu
           title="B tv Agent"
           headerIcon={ICON_PATH.SIDE_MENU.MENU}
           menuHeaderItems={menuHeaderItems}
          menuItems={menuItems}
          historyItems={historyItems}
          onMenuItemClick={handleMenuClick}
          onHistoryItemClick={handleHistoryClick}
        />
      </section>
    </div>
  );
};

export default Home;
