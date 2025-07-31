export const ICON_PATH = {
  SIDE_MENU: {
    MENU: `${import.meta.env.BASE_URL}/assets/sideMenu/ic_menu_nor.png`,
    NEW_CHAT: `${import.meta.env.BASE_URL}assets/sideMenu/ic_new_nor.png`,
    JIRA: `${import.meta.env.BASE_URL}assets/sideMenu/ic_jira_nor.png`,
    CR: `${import.meta.env.BASE_URL}assets/sideMenu/ic_cr_nor.png`,
    POLICY: `${import.meta.env.BASE_URL}assets/sideMenu/ic_rule_nor.png`,
    PERSON: `${import.meta.env.BASE_URL}assets/sideMenu/ic_person_nor.png`,
  },
  HISTORY_MENU: {
    NEW_CHAT: `${import.meta.env.BASE_URL}assets/sideMenu/ic_history_new_nor.png`,
    JIRA: `${import.meta.env.BASE_URL}assets/sideMenu/ic_history_jira_nor.png`,
    CR: `${import.meta.env.BASE_URL}assets/sideMenu/ic_history_cr_nor.png`,
    POLICY: `${import.meta.env.BASE_URL}assets/sideMenu/ic_history_rule_nor.png`,
    PERSON: `${import.meta.env.BASE_URL}assets/sideMenu/ic_history_person_nor.png`,
  },
  SAVE_BUTTON: {
    NORMAL: `${import.meta.env.BASE_URL}assets/sideMenu/ic_save_nor.png`,
    SELECTED: `${import.meta.env.BASE_URL}assets/sideMenu/ic_save_sel.png`,
  },
  CHAT_HEADER: {
    JIRA: `${import.meta.env.BASE_URL}assets/chatHeader/header_jira.png`,
    CR: `${import.meta.env.BASE_URL}assets/chatHeader/header_cr.png`,
    POLICY: `${import.meta.env.BASE_URL}assets/chatHeader/header_policy.png`,
    PERSON: `${import.meta.env.BASE_URL}assets/chatHeader/header_person.png`,
  },
} as const;

export const CHAT_INPUT_PLACEHOLDER = {
  JIRA: 'Jira 일감 번호를 입력해 주세요',
  CR: 'BR 번호를 입력해 주세요',
  POLICY: '"홈 배너 노출 조건이 뭐야?"라고 질문해 보세요',
  PERSON: '"홈 전시 담당하는 개발자와 UI담당자를 알려줘"라고 요청해 보세요',
  DEFAULT: 'B tv 개발에 필요한 무엇이든 물어보세요',
};
