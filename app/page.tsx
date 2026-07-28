"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TutorialPoint = {
  id: number;
  x: number;
  y: number;
  title: string;
  category: string;
  description: string;
  checkpoint: string;
};

type ErrorItem = {
  id: number;
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  title: string;
  category: string;
  clue: string;
  explanation: string;
  action: string;
};

type CaseId = "ot" | "mi" | "fall" | "infection";
type Screen = "lobby" | "briefing" | "room" | "result";
type ResultReason = "complete" | "time" | "submitted";

type CaseConfig = {
  id: CaseId;
  order: string;
  badge: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  image: string;
  mode: "tutorial" | "challenge";
  patient: string;
  diagnosis: string;
  situation: string;
  vitals: string;
  handoff: string;
  mission: string;
  timeLimit: number;
  objectives: string[];
  color: string;
  errors: ErrorItem[];
};

const TUTORIAL_POINTS: TutorialPoint[] = [
  {
    id: 1,
    x: 12.5,
    y: 49,
    title: "손위생 구역",
    category: "감염관리",
    description:
      "병실 입구 쪽 세면대와 손위생 설비입니다. 환자 접촉 전후와 체액 노출 위험 뒤에는 상황에 맞는 손위생을 시행합니다.",
    checkpoint:
      "WHO 손위생 5가지 시점을 떠올리고 물과 비누 또는 손소독제 중 적절한 방법을 선택하세요.",
  },
  {
    id: 2,
    x: 34,
    y: 34,
    title: "개인보호구 보관함",
    category: "감염관리",
    description:
      "장갑과 보호구가 준비된 구역입니다. 예상되는 노출과 격리 유형에 맞는 PPE를 선택해야 합니다.",
    checkpoint:
      "장갑은 손위생을 대신하지 않습니다. 착용 전과 제거 후 손위생을 확인하세요.",
  },
  {
    id: 3,
    x: 34,
    y: 52,
    title: "응급카트",
    category: "응급간호",
    description:
      "응급약품과 소생 장비를 보관하는 카트입니다. 언제든 즉시 사용할 수 있도록 표준화된 점검이 필요합니다.",
    checkpoint:
      "봉인 상태, 약품 유효기간, 제세동기 전원과 필수 물품의 위치를 확인하세요.",
  },
  {
    id: 4,
    x: 92,
    y: 68,
    title: "의료폐기물 분리",
    category: "환자안전",
    description:
      "일반·감염성 폐기물을 분리하는 구역입니다. 오염 물품을 종류에 맞게 즉시 분리해 교차감염을 예방합니다.",
    checkpoint:
      "용기 종류, 과충전 여부, 뚜껑 폐쇄와 손상 여부를 확인하세요.",
  },
  {
    id: 5,
    x: 44,
    y: 40,
    title: "프라이버시 커튼",
    category: "기본간호",
    description:
      "검사와 처치 중 환자의 사생활을 보호하는 커튼입니다. 접촉이 잦은 환경 표면이기도 합니다.",
    checkpoint:
      "처치 전 설명과 동의를 구하고 커튼을 닫은 뒤, 접촉 후 손위생을 시행하세요.",
  },
  {
    id: 6,
    x: 63,
    y: 39,
    title: "수액과 주입펌프",
    category: "투약안전",
    description:
      "수액 백과 다중 주입펌프가 연결된 구역입니다. 처방부터 환자까지 라인을 따라가며 설정을 검증합니다.",
    checkpoint:
      "대상자·약물·용량·경로·시간과 함께 속도, 기포, 꺾임, 연결 상태를 확인하세요.",
  },
  {
    id: 7,
    x: 68,
    y: 29,
    title: "환자감시장치",
    category: "환자평가",
    description:
      "활력징후와 심전도 파형을 관찰하는 모니터입니다. 화면의 숫자와 실제 환자 상태를 함께 평가해야 합니다.",
    checkpoint:
      "알람 한계값, 리드 연결, 센서 부착과 아티팩트를 확인하고 알람을 임의로 끄지 마세요.",
  },
  {
    id: 8,
    x: 78,
    y: 35,
    title: "산소·흡인 장치",
    category: "호흡간호",
    description:
      "침상 머리맡의 의료가스·흡인 포트입니다. 색상만 믿지 말고 라벨과 연결 위치를 확인합니다.",
    checkpoint:
      "처방된 산소 유량, 가습 필요성, 흡인압과 튜브 연결 상태를 확인하세요.",
  },
  {
    id: 9,
    x: 77,
    y: 54,
    title: "침상 안전장치",
    category: "낙상예방",
    description:
      "전동침대의 난간·조작부·바퀴가 있는 구역입니다. 환자의 낙상 위험과 활동 수준에 맞춰 조정합니다.",
    checkpoint:
      "침상 최저 위치, 바퀴 잠금, 난간 적용과 주변 이동 동선을 확인하세요.",
  },
  {
    id: 10,
    x: 85,
    y: 52,
    title: "호출벨·침상 주변",
    category: "의사소통",
    description:
      "환자가 도움을 요청할 수 있는 호출 장치와 개인 물품 구역입니다. 손이 닿는 위치에 두고 사용법을 안내합니다.",
    checkpoint:
      "호출벨과 개인 물품의 접근성, 야간 조명과 이동 경로를 확인하세요.",
  },
];

const CASES: CaseConfig[] = [
  {
    id: "ot",
    order: "OT",
    badge: "예행연습",
    title: "표준 병실 탐색",
    shortTitle: "OT · 표준 병실",
    subtitle: "오류가 없는 병실에서 조작법과 안전점검 기준을 익힙니다.",
    image: "/assets/hospital-room-v3.webp",
    mode: "tutorial",
    patient: "표준 병실",
    diagnosis: "오리엔테이션",
    situation:
      "실전 사례에 들어가기 전 병실을 움직이고 확대하는 방법, 표식을 선택하는 방법, 간호 확인 포인트를 읽는 방법을 연습합니다.",
    vitals: "해당 없음",
    handoff: "파란 표식 10개를 자유롭게 확인하세요.",
    mission: "안전점검 지점 10개 확인",
    timeLimit: 0,
    objectives: ["시점 이동·확대 연습", "병실 장비 위치 확인", "안전점검 기준 익히기"],
    color: "#45d4cd",
    errors: [],
  },
  {
    id: "mi",
    order: "01",
    badge: "응급·순환",
    title: "급성심근경색 초기간호",
    shortTitle: "사례 1 · 급성심근경색",
    subtitle: "PCI 준비 중인 환자의 산소·수액·응급간호 환경을 점검합니다.",
    image: "/assets/case-1-mi-v3.webp",
    mode: "challenge",
    patient: "김○○ · 68세 · 남성",
    diagnosis: "STEMI · PCI 준비",
    situation:
      "갑작스러운 흉통과 식은땀으로 응급실에 방문해 급성심근경색을 진단받았습니다. 헤파린과 니트로글리세린 치료가 시작되었고 지속적인 ECG 감시와 응급상황 대비가 필요합니다.",
    vitals: "BP 94/62 · HR 108 · RR 24 · SpO₂ 91%",
    handoff: "의식 명료 · 흉통 NRS 7 · 식은땀 지속",
    mission: "6분 안에 오류 10개 찾기",
    timeLimit: 360,
    objectives: ["산소공급 안전", "정맥주입·투약 안전", "응급접근성 확보"],
    color: "#ff8c6b",
    errors: [
      {
        id: 1,
        x: 84,
        y: 55,
        radiusX: 5,
        radiusY: 19,
        title: "산소 튜브 연결 이탈",
        category: "호흡간호",
        clue: "침상 머리맡의 산소 공급 경로를 끝까지 따라가 보세요.",
        explanation:
          "산소 튜브가 벽면 공급구에서 분리되어 바닥으로 늘어져 있습니다. 처방된 산소가 환자에게 전달되지 않을 수 있습니다.",
        action:
          "공급구–유량계–가습병–환자 인터페이스까지 연결 상태를 확인하고 SpO₂를 재평가합니다.",
      },
      {
        id: 2,
        x: 63,
        y: 17,
        radiusX: 5,
        radiusY: 9,
        title: "거의 비어 있는 무표기 수액",
        category: "정맥주입",
        clue: "수액걸대 가장 위쪽의 백과 라벨을 확인하세요.",
        explanation:
          "수액 백이 거의 비어 있고 적절한 표기가 없습니다. 공기 유입, 주입 중단, 약물 확인 오류가 발생할 수 있습니다.",
        action:
          "처방·라벨·잔량을 대조하고 교체 시점을 계획한 뒤 환자부터 수액까지 라인을 추적합니다.",
      },
      {
        id: 3,
        x: 63,
        y: 40,
        radiusX: 5,
        radiusY: 9,
        title: "주입 라인 꺾임",
        category: "투약안전",
        clue: "주입펌프 주변의 튜브가 곧게 연결되어 있는지 살펴보세요.",
        explanation:
          "수액 라인이 펌프 주변에서 꺾여 있어 약물과 수액이 설정 속도로 주입되지 않을 수 있습니다.",
        action:
          "라인 꺾임과 압박을 해소하고 펌프 알람·설정 속도·주입부위를 다시 확인합니다.",
      },
      {
        id: 4,
        x: 70,
        y: 58,
        radiusX: 6,
        radiusY: 3.5,
        title: "무표기 약물 방치",
        category: "투약안전",
        clue: "환자 식탁 위에 주인을 확인할 수 없는 물품이 있는지 보세요.",
        explanation:
          "무표기 약물컵과 뚜껑이 열린 주사기가 오버베드 테이블에 방치되어 대상자·약물 확인이 불가능합니다.",
        action:
          "출처가 불명확한 약물은 투여하지 말고 즉시 폐기한 뒤 6 Rights에 따라 다시 준비합니다.",
      },
      {
        id: 5,
        x: 31,
        y: 68.5,
        radiusX: 4.5,
        radiusY: 5.5,
        title: "응급카트 접근 차단",
        category: "응급대응",
        clue: "응급카트 앞까지 바로 접근할 수 있는지 이동 동선을 확인하세요.",
        explanation:
          "물품 상자가 응급카트 앞을 막고 있어 심정지 등 응급상황에서 장비 접근이 지연될 수 있습니다.",
        action:
          "응급카트 전면과 이동 경로를 즉시 비우고 봉인·제세동기·필수물품을 점검합니다.",
      },
      {
        id: 6,
        x: 79,
        y: 78.5,
        radiusX: 4.5,
        radiusY: 5.5,
        title: "호출벨 접근 불가",
        category: "의사소통",
        clue: "환자가 흉통 악화를 알릴 수 있는 호출 장치의 위치를 확인하세요.",
        explanation:
          "호출벨이 침상 옆 바닥에 떨어져 있어 환자가 흉통 악화나 응급상황을 알리기 어렵습니다.",
        action:
          "호출벨을 우세손이 닿는 위치에 두고 사용법을 안내한 뒤 실제 작동 여부를 확인합니다.",
      },
      {
        id: 7,
        x: 51,
        y: 66.5,
        radiusX: 11,
        radiusY: 5.5,
        title: "침상 난간 하강",
        category: "낙상예방",
        clue: "환자 가까이에 있는 침상 난간의 높이를 살펴보세요.",
        explanation:
          "저혈압과 흉통이 있는 환자의 가까운 쪽 난간이 내려가 있어 낙상 위험이 높습니다.",
        action:
          "환자 상태에 맞게 난간을 적용하고 침상 최저 위치·바퀴 잠금·낙상주의를 함께 확인합니다.",
      },
      {
        id: 8,
        x: 70.5,
        y: 52.5,
        radiusX: 4.5,
        radiusY: 3.5,
        title: "ECG 전극·리드 분리",
        category: "심전도 감시",
        clue: "베개와 침상 상단에서 심전도 감시선이 실제로 연결되어 있는지 확인하세요.",
        explanation:
          "ECG 전극과 리드가 환자에게 연결되지 않은 채 침상 위에 놓여 있어 허혈 변화나 치명적 부정맥을 즉시 감지하기 어렵습니다.",
        action:
          "피부 상태를 확인해 전극을 올바른 위치에 부착하고 리드 연결·파형·알람 한계값을 재확인합니다.",
      },
      {
        id: 9,
        x: 54.5,
        y: 58,
        radiusX: 5,
        radiusY: 4,
        title: "노출된 주사침의 침상 방치",
        category: "주사침 안전",
        clue: "흰 침상 린넨 위에 찔림 사고를 일으킬 수 있는 물품이 있는지 보세요.",
        explanation:
          "뚜껑이 없는 주사침이 침상 위에 놓여 있어 환자와 의료진의 찔림 사고 및 혈액매개 감염 위험이 있습니다.",
        action:
          "손으로 다시 뚜껑을 씌우지 말고 즉시 전용 샤프용기에 폐기한 뒤 노출 여부를 확인합니다.",
      },
      {
        id: 10,
        x: 31,
        y: 78,
        radiusX: 7,
        radiusY: 6,
        title: "산소마스크 바닥 방치",
        category: "호흡간호",
        clue: "침상 왼쪽 바닥에 환자에게 적용할 호흡 보조기구가 놓여 있는지 살펴보세요.",
        explanation:
          "산소마스크가 바닥에 떨어져 오염되었으며, 저산소증 악화 시 즉시 안전하게 적용할 수 없습니다.",
        action:
          "오염된 마스크를 폐기하고 새 장비로 교체한 뒤 산소 공급원 연결과 처방 유량을 확인합니다.",
      },
    ],
  },
  {
    id: "fall",
    order: "02",
    badge: "수술·낙상",
    title: "수술 후 고령환자",
    shortTitle: "사례 2 · 낙상 고위험",
    subtitle: "고관절 수술 후 첫 보행을 앞둔 환자의 낙상위험을 찾습니다.",
    image: "/assets/case-2-fall-v3.webp",
    mode: "challenge",
    patient: "박○○ · 79세 · 여성",
    diagnosis: "고관절 치환술 · POD 1",
    situation:
      "야간 진통제 투여 후 어지러움을 호소했으며 오늘 물리치료사와 첫 보행을 계획하고 있습니다. 보행 시 1인 이상의 도움이 필요합니다.",
    vitals: "BP 118/70 · HR 84 · RR 18 · SpO₂ 96%",
    handoff: "Morse 70점 · 어지러움 있음 · 보행보조 필요",
    mission: "6분 안에 오류 10개 찾기",
    timeLimit: 360,
    objectives: ["침상 안전", "환경 위험 제거", "호출·보행 지원"],
    color: "#f5bf55",
    errors: [
      {
        id: 1,
        x: 69,
        y: 57,
        radiusX: 16,
        radiusY: 12,
        title: "침상 높이 과도",
        category: "낙상예방",
        clue: "침상과 바닥 사이의 높이를 바퀴 주변에서 확인하세요.",
        explanation:
          "낙상 고위험 환자의 침상이 높은 위치에 있어 혼자 내려오려 할 때 중대한 낙상으로 이어질 수 있습니다.",
        action:
          "간호 후 침상을 최저 위치로 낮추고 바퀴 잠금과 환자 발의 바닥 지지 여부를 확인합니다.",
      },
      {
        id: 2,
        x: 65,
        y: 54,
        radiusX: 12,
        radiusY: 8,
        title: "가까운 쪽 난간 하강",
        category: "낙상예방",
        clue: "환자가 쉽게 몸을 돌릴 수 있는 가까운 쪽 난간을 보세요.",
        explanation:
          "가까운 쪽 난간이 완전히 내려가 있어 어지러운 환자가 침상 밖으로 미끄러질 위험이 있습니다.",
        action:
          "환자 상태와 기관 지침에 맞게 난간을 적용하고 과도한 억제가 되지 않도록 개별 평가합니다.",
      },
      {
        id: 3,
        x: 52.5,
        y: 77,
        radiusX: 6.5,
        radiusY: 5.5,
        title: "젖은 바닥",
        category: "환경안전",
        clue: "침상에서 화장실로 이동할 때 발이 닿을 바닥을 살펴보세요.",
        explanation:
          "침상 옆 바닥에 물기가 남아 있어 보행 중 미끄러질 위험이 큽니다.",
        action:
          "즉시 접근을 제한하고 물기를 제거한 뒤 원인을 확인하며, 제거 전까지 환자의 독립 보행을 막습니다.",
      },
      {
        id: 4,
        x: 33,
        y: 86,
        radiusX: 8,
        radiusY: 6,
        title: "보행로의 슬리퍼",
        category: "환경안전",
        clue: "침상 아래와 이동 동선에 걸려 넘어질 물건이 있는지 보세요.",
        explanation:
          "슬리퍼가 보행 동선 한가운데 흩어져 있어 발이 걸리거나 균형을 잃을 수 있습니다.",
        action:
          "신발을 정리하고 뒤꿈치가 고정되는 미끄럼방지 신발을 착용시킨 뒤 보행을 돕습니다.",
      },
      {
        id: 5,
        x: 45,
        y: 76.5,
        radiusX: 21,
        radiusY: 2.5,
        title: "바닥을 가로지르는 수액선",
        category: "정맥주입",
        clue: "수액걸대에서 환자까지 이어지는 선이 보행로를 침범하는지 확인하세요.",
        explanation:
          "수액 튜브가 바닥과 보행 동선을 가로질러 환자와 의료진 모두에게 걸림 위험을 만듭니다.",
        action:
          "라인을 침상 쪽으로 정리하고 충분한 여유 길이와 연결부 고정을 확인한 뒤 이동합니다.",
      },
      {
        id: 6,
        x: 79,
        y: 80,
        radiusX: 8,
        radiusY: 8,
        title: "호출벨이 바닥에 있음",
        category: "의사소통",
        clue: "환자가 혼자 일어나기 전에 도움을 요청할 수 있는지 확인하세요.",
        explanation:
          "호출벨이 바닥에 있어 환자가 도움을 요청하지 못하고 혼자 일어날 가능성이 높습니다.",
        action:
          "호출벨을 손이 닿는 위치에 두고 혼자 일어나지 않도록 설명한 뒤 teach-back으로 확인합니다.",
      },
      {
        id: 7,
        x: 92.5,
        y: 66,
        radiusX: 4.8,
        radiusY: 12.5,
        title: "폐기물통 과충전",
        category: "환경안전",
        clue: "창가 수납장 옆 폐기물 용기의 뚜껑과 내용물 높이를 살펴보세요.",
        explanation:
          "임상폐기물통이 넘치고 뚜껑이 열려 있어 오염 물질 노출과 교차오염 위험이 있습니다.",
        action:
          "용기를 밀봉·교체하고 주변 오염을 확인한 뒤 지정된 폐기물 관리 구역을 정리합니다.",
      },
      {
        id: 8,
        x: 16,
        y: 55,
        radiusX: 6,
        radiusY: 14,
        title: "보행보조기 접근 불가",
        category: "낙상예방",
        clue: "첫 보행에 사용할 보조기가 환자의 위치에서 안전하게 준비되어 있는지 확인하세요.",
        explanation:
          "보행기가 문에 기대어 접힌 채 침상에서 멀리 떨어져 있어 환자가 도움 없이 일어나 이동하려 할 가능성이 높습니다.",
        action:
          "환자의 키와 체중부하 수준에 맞게 보행기를 조절하고, 간호사나 치료사가 동행할 때 손이 닿는 위치에 준비합니다.",
      },
      {
        id: 9,
        x: 59.5,
        y: 71.5,
        radiusX: 4.5,
        radiusY: 4,
        title: "배액주머니 바닥 접촉",
        category: "배액관리",
        clue: "침상 아래의 소변 배액주머니가 바닥과 분리되어 있는지 살펴보세요.",
        explanation:
          "소변 배액주머니가 바닥에 놓여 오염될 수 있고, 이동 시 배액관이 당겨지거나 발에 걸릴 위험이 있습니다.",
        action:
          "주머니를 방광보다 낮고 바닥에는 닿지 않는 전용 걸이에 고정하고 배액관의 꺾임과 장력을 확인합니다.",
      },
      {
        id: 10,
        x: 45.5,
        y: 66,
        radiusX: 7,
        radiusY: 8.5,
        title: "바닥까지 늘어진 침상 린넨",
        category: "환경안전",
        clue: "침상 발치의 흰 린넨이 보행로까지 내려와 있는지 확인하세요.",
        explanation:
          "침상 린넨이 바닥까지 길게 늘어져 있어 환자나 의료진의 발이 걸리고 오염된 바닥과 접촉할 수 있습니다.",
        action:
          "바닥에 닿은 린넨을 새것으로 교체하고 침상 안쪽으로 정리해 이동 동선을 확보합니다.",
      },
    ],
  },
  {
    id: "infection",
    order: "03",
    badge: "격리·투약",
    title: "접촉주의 감염환자",
    shortTitle: "사례 3 · 감염·투약안전",
    subtitle: "MRSA 접촉주의 병실의 감염관리와 투약 오류를 찾습니다.",
    image: "/assets/case-3-infection-v3.webp",
    mode: "challenge",
    patient: "이○○ · 62세 · 남성",
    diagnosis: "당뇨발 감염 · MRSA",
    situation:
      "당뇨발 감염으로 정맥 항생제를 투여 중이며 배양검사에서 MRSA가 확인되어 접촉주의가 적용되었습니다.",
    vitals: "BP 126/76 · HR 92 · RR 20 · BT 38.1℃",
    handoff: "접촉주의 · 말초정맥 항생제 · 상처 배액 있음",
    mission: "6분 안에 오류 10개 찾기",
    timeLimit: 360,
    objectives: ["접촉주의 준수", "폐기물·샤프 안전", "무균적 투약관리"],
    color: "#a78bfa",
    errors: [
      {
        id: 1,
        x: 9,
        y: 61,
        radiusX: 7,
        radiusY: 8,
        title: "사용한 장갑의 세면대 방치",
        category: "손위생",
        clue: "손을 씻는 공간이 깨끗하게 유지되고 있는지 살펴보세요.",
        explanation:
          "사용한 장갑이 세면대에 방치되어 손위생 구역을 오염시키고 교차감염을 유발할 수 있습니다.",
        action:
          "장갑을 적절한 폐기물통에 버리고 환경을 소독한 뒤 손위생을 시행합니다.",
      },
      {
        id: 2,
        x: 34,
        y: 34,
        radiusX: 7,
        radiusY: 8,
        title: "PPE 보관함 오염·무질서",
        category: "접촉주의",
        clue: "병실에 들어가기 전 사용할 보호구가 청결하게 보관되는지 확인하세요.",
        explanation:
          "보호구 보관함에 구겨진 장갑이 튀어나와 청결 물품의 오염과 잘못된 PPE 선택 가능성이 있습니다.",
        action:
          "오염 가능 물품을 제거하고 필요한 PPE를 규격별로 깨끗하게 보충합니다.",
      },
      {
        id: 3,
        x: 35,
        y: 45,
        radiusX: 7,
        radiusY: 8,
        title: "샤프용기 과충전",
        category: "주사침 안전",
        clue: "파란 카트 위 작은 폐기용기의 충전선을 확인하세요.",
        explanation:
          "샤프용기가 과충전되어 주사기 일부가 밖으로 돌출되어 있어 찔림 사고 위험이 큽니다.",
        action:
          "손으로 밀어 넣지 말고 용기를 잠가 교체하며 노출 사고 시 기관 절차에 따라 즉시 보고합니다.",
      },
      {
        id: 4,
        x: 82.8,
        y: 81.3,
        radiusX: 4.7,
        radiusY: 10.5,
        title: "개방된 감염성 폐기물통",
        category: "폐기물관리",
        clue: "창가 수납장과 방문자 의자 사이 붉은색 폐기물통을 확인하세요.",
        explanation:
          "감염성 폐기물통 뚜껑이 열려 있고 오염 거즈가 밖으로 나와 환경오염 위험이 있습니다.",
        action:
          "PPE를 착용하고 노출 물품을 안전하게 수거한 뒤 용기를 밀봉·교체하고 주변을 소독합니다.",
      },
      {
        id: 5,
        x: 70,
        y: 58,
        radiusX: 8,
        radiusY: 8,
        title: "무표기 약물과 주사기",
        category: "투약안전",
        clue: "환자 식탁 위에 이름과 용량을 확인할 수 없는 약물이 있는지 보세요.",
        explanation:
          "무표기 약물컵과 뚜껑이 열린 주사기가 방치되어 잘못된 환자·약물·경로로 투여될 수 있습니다.",
        action:
          "출처 불명 약물을 폐기하고 손위생 후 처방과 6 Rights에 맞춰 새로 준비합니다.",
      },
      {
        id: 6,
        x: 72.5,
        y: 77,
        radiusX: 6,
        radiusY: 5,
        title: "IV 라인 끝이 바닥에 접촉",
        category: "무균술",
        clue: "주입펌프에서 내려오는 라인의 끝부분이 어디에 닿는지 보세요.",
        explanation:
          "분리된 IV 라인의 열린 끝이 바닥에 닿아 있어 다시 연결하면 혈류감염을 유발할 수 있습니다.",
        action:
          "오염된 라인은 재사용하지 말고 무균적으로 교체하며 연결부와 삽입부를 함께 평가합니다.",
      },
      {
        id: 7,
        x: 29,
        y: 47,
        radiusX: 7,
        radiusY: 8,
        title: "치료장비 옆 음료",
        category: "투약환경",
        clue: "파란 치료 카트 주변에 치료와 무관한 개인 물품이 놓여 있는지 확인하세요.",
        explanation:
          "음료가 치료·모니터 장비 가까이에 있어 유출 시 장비 오염과 전기적 위험, 청결구역 오염을 일으킬 수 있습니다.",
        action:
          "음료와 개인 물품을 환자용 구역으로 옮기고 약물·장비 주변을 청결하게 유지합니다.",
      },
      {
        id: 8,
        x: 21.5,
        y: 77,
        radiusX: 9,
        radiusY: 7,
        title: "사용한 격리가운 바닥 방치",
        category: "접촉주의",
        clue: "병실 출입문 안쪽 바닥에 사용 후 폐기해야 할 보호구가 남아 있는지 보세요.",
        explanation:
          "사용한 격리가운이 바닥에 방치되어 환경을 오염시키고 의료진의 신발이나 장비를 통해 MRSA를 전파할 수 있습니다.",
        action:
          "접촉을 최소화해 지정 감염성 폐기물통에 버리고 오염 범위를 소독한 뒤 손위생을 시행합니다.",
      },
      {
        id: 9,
        x: 55.5,
        y: 57.5,
        radiusX: 5,
        radiusY: 4,
        title: "혈액 오염 드레싱의 침상 방치",
        category: "오염물 관리",
        clue: "흰 침상 린넨 위에 혈액이나 삼출물이 묻은 물품이 놓여 있는지 확인하세요.",
        explanation:
          "혈액이 묻은 사용한 거즈가 침상 위에 남아 있어 환자 주변 환경과 의료진의 손을 오염시킬 위험이 있습니다.",
        action:
          "PPE를 착용해 거즈를 감염성 폐기물로 처리하고 오염된 린넨을 교체한 뒤 환경을 소독합니다.",
      },
      {
        id: 10,
        x: 88.2,
        y: 50.5,
        radiusX: 4,
        radiusY: 5,
        title: "개방된 검체 용기",
        category: "검체관리",
        clue: "전화기와 화분 주변의 검체 용기가 밀폐되어 있는지 살펴보세요.",
        explanation:
          "뚜껑이 열린 검체 용기와 노출된 면봉이 환자용 수납장에 놓여 누출·오염과 검체 식별 오류를 일으킬 수 있습니다.",
        action:
          "새 멸균 용기에 적절히 재채취하고 즉시 밀봉·라벨링한 뒤 전용 운반백으로 검사실에 보냅니다.",
      },
    ],
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getHorizontalPanLimit = () =>
  typeof window !== "undefined" && window.innerWidth < window.innerHeight
    ? 44
    : 11;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

type OrientationPermissionEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [caseId, setCaseId] = useState<CaseId>("ot");
  const [view, setView] = useState({ x: 3, y: 0, zoom: 1.06 });
  const [gyroOffset, setGyroOffset] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tutorialDone, setTutorialDone] = useState<Set<number>>(new Set());
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrongClicks, setWrongClicks] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [resultReason, setResultReason] =
    useState<ResultReason>("submitted");
  const [markersVisible, setMarkersVisible] = useState(true);
  const [briefOpen, setBriefOpen] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "miss" | "info";
    text: string;
  } | null>(null);
  const [missMarker, setMissMarker] = useState<{
    x: number;
    y: number;
    key: number;
  } | null>(null);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vrMode, setVrMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const viewerRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    moved: false,
  });
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef({ distance: 0, zoom: 1.06 });
  const orientationCalibration = useRef<{
    beta: number;
    gamma: number;
  } | null>(null);

  const currentCase = useMemo(
    () => CASES.find((item) => item.id === caseId) ?? CASES[0],
    [caseId],
  );

  const selectedTutorial = useMemo(
    () =>
      currentCase.mode === "tutorial"
        ? TUTORIAL_POINTS.find((point) => point.id === selectedId) ?? null
        : null,
    [currentCase.mode, selectedId],
  );

  const selectedError = useMemo(
    () =>
      currentCase.mode === "challenge"
        ? currentCase.errors.find((item) => item.id === selectedId) ?? null
        : null,
    [currentCase, selectedId],
  );

  const totalTargets =
    currentCase.mode === "tutorial"
      ? TUTORIAL_POINTS.length
      : currentCase.errors.length;
  const completedCount =
    currentCase.mode === "tutorial" ? tutorialDone.size : found.size;

  const sceneX = view.x + gyroOffset.x;
  const sceneY = view.y + gyroOffset.y;
  const sceneStyle = {
    "--scene-x": `${sceneX}%`,
    "--scene-y": `${sceneY}%`,
    "--scene-zoom": view.zoom,
    "--scene-tilt-x": `${sceneY * 0.16}deg`,
    "--scene-tilt-y": `${sceneX * -0.22}deg`,
    "--vr-x": `${sceneX * -1.35}%`,
    "--vr-y": `${sceneY * -1.1}%`,
  } as CSSProperties;

  const missedCount =
    currentCase.mode === "challenge"
      ? currentCase.errors.length - found.size
      : 0;
  const score =
    currentCase.mode === "challenge"
      ? Math.max(0, 100 - wrongClicks * 3 - hintsUsed * 5 - missedCount * 10)
      : 100;
  const elapsed =
    currentCase.timeLimit > 0 ? currentCase.timeLimit - remaining : 0;

  const resetView = useCallback(() => {
    setView({ x: 3, y: 0, zoom: 1.06 });
    setGyroOffset({ x: 0, y: 0 });
    orientationCalibration.current = null;
  }, []);

  const showFeedback = useCallback(
    (kind: "success" | "miss" | "info", text: string) => {
      setFeedback({ kind, text });
      window.setTimeout(() => {
        setFeedback((current) =>
          current?.text === text ? null : current,
        );
      }, 2600);
    },
    [],
  );

  const selectCase = (nextCaseId: CaseId) => {
    setCaseId(nextCaseId);
    setScreen("briefing");
    setSelectedId(null);
    setBriefOpen(false);
  };

  const startCase = () => {
    setTutorialDone(new Set());
    setFound(new Set());
    setWrongClicks(0);
    setHintsUsed(0);
    setHintText(null);
    setFeedback(null);
    setMissMarker(null);
    setSelectedId(null);
    setMarkersVisible(true);
    setRemaining(currentCase.timeLimit);
    setResultReason("submitted");
    setBriefOpen(false);
    resetView();
    setScreen("room");
  };

  const finishCase = useCallback((reason: ResultReason) => {
    setResultReason(reason);
    setSelectedId(null);
    setHintText(null);
    setVrMode(false);
    setScreen("result");
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await viewerRef.current?.requestFullscreen();
      }
    } catch {
      showFeedback("info", "이 기기에서는 전체화면을 사용할 수 없습니다.");
    }
  }, [showFeedback]);

  const enableGyro = useCallback(async () => {
    if (reducedMotion) {
      showFeedback(
        "info",
        "‘모션 줄임’을 해제한 뒤 기울기 보기를 사용하세요.",
      );
      return;
    }
    if (typeof DeviceOrientationEvent === "undefined") {
      showFeedback("info", "이 기기는 기울기 센서를 지원하지 않습니다.");
      return;
    }

    try {
      const orientationEvent =
        DeviceOrientationEvent as OrientationPermissionEvent;
      if (orientationEvent.requestPermission) {
        const permission = await orientationEvent.requestPermission();
        if (permission !== "granted") {
          showFeedback("info", "기울기 센서 권한이 허용되지 않았습니다.");
          return;
        }
      }
      orientationCalibration.current = null;
      setGyroEnabled(true);
      showFeedback("info", "휴대폰을 천천히 기울여 병실을 관찰하세요.");
    } catch {
      showFeedback("info", "기울기 센서를 시작하지 못했습니다.");
    }
  }, [reducedMotion, showFeedback]);

  const toggleVrMode = useCallback(async () => {
    setSelectedId(null);
    setVrMode((current) => !current);
    if (!vrMode && !document.fullscreenElement) {
      try {
        await viewerRef.current?.requestFullscreen();
      } catch {
        showFeedback("info", "전체화면 없이 VR 고글 보기를 시작합니다.");
      }
    }
    if (vrMode && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // The persistent exit button remains available.
      }
    }
  }, [showFeedback, vrMode]);

  const completeTutorialPoint = (id: number) => {
    setTutorialDone((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
    showFeedback("success", "안전점검 지점을 확인했습니다.");
  };

  const focusTutorialPoint = (point: TutorialPoint) => {
    const portrait =
      typeof window !== "undefined" && window.innerWidth < window.innerHeight;
    const panLimit = getHorizontalPanLimit();
    setMarkersVisible(true);
    setSelectedId(point.id);
    setView((current) => ({
      ...current,
      x: portrait
        ? clamp(50 - point.x, -panLimit, panLimit)
        : clamp(50 - point.x, -11, 11),
      y: portrait ? clamp(50 - point.y, -12, 12) : current.y,
    }));
  };

  const revealHint = () => {
    const unresolved = currentCase.errors.filter((item) => !found.has(item.id));
    if (unresolved.length === 0) {
      showFeedback("info", "모든 오류를 찾았습니다.");
      return;
    }
    const target = unresolved[hintsUsed % unresolved.length];
    setHintText(target.clue);
    setHintsUsed((current) => current + 1);
  };

  const markRoomClick = useCallback(
    (clientX: number, clientY: number) => {
      if (
        screen !== "room" ||
        currentCase.mode !== "challenge" ||
        !sceneRef.current
      ) {
        return;
      }

      const rect = sceneRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) return;

      const orderedErrors = [
        ...currentCase.errors.filter((item) => !found.has(item.id)),
        ...currentCase.errors.filter((item) => found.has(item.id)),
      ];
      const hit = orderedErrors.find((item) => {
        const normalizedX = (x - item.x) / item.radiusX;
        const normalizedY = (y - item.y) / item.radiusY;
        return normalizedX ** 2 + normalizedY ** 2 <= 1;
      });

      if (hit) {
        if (found.has(hit.id)) {
          setSelectedId(hit.id);
          showFeedback("info", "이미 찾은 오류입니다.");
          return;
        }

        const nextFound = new Set(found);
        nextFound.add(hit.id);
        setFound(nextFound);
        setSelectedId(hit.id);
        setHintText(null);
        showFeedback("success", `정답입니다 · ${hit.title}`);

        if (nextFound.size === currentCase.errors.length) {
          window.setTimeout(() => finishCase("complete"), 900);
        }
        return;
      }

      setWrongClicks((current) => current + 1);
      setMissMarker({ x, y, key: Date.now() });
      showFeedback("miss", "오류가 아닙니다. 다른 위치를 관찰하세요.");
      window.setTimeout(() => setMissMarker(null), 850);
    },
    [currentCase, finishCase, found, screen, showFeedback],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    const frame = window.requestAnimationFrame(updatePreference);
    media.addEventListener("change", updatePreference);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) setVrMode(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!gyroEnabled || reducedMotion) return;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      if (!orientationCalibration.current) {
        orientationCalibration.current = {
          beta: event.beta,
          gamma: event.gamma,
        };
      }
      const origin = orientationCalibration.current;
      const nextX = clamp((event.gamma - origin.gamma) * 0.19, -8, 8);
      const nextY = clamp((event.beta - origin.beta) * 0.12, -5, 5);
      setGyroOffset((current) => ({
        x: current.x * 0.72 + nextX * 0.28,
        y: current.y * 0.72 + nextY * 0.28,
      }));
    };
    window.addEventListener("deviceorientation", onOrientation, true);
    return () =>
      window.removeEventListener("deviceorientation", onOrientation, true);
  }, [gyroEnabled, reducedMotion]);

  useEffect(() => {
    if (
      screen !== "room" ||
      currentCase.mode !== "challenge" ||
      remaining <= 0
    ) {
      return;
    }
    const timer = window.setInterval(
      () => setRemaining((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [currentCase.mode, remaining, screen]);

  useEffect(() => {
    if (
      screen !== "room" ||
      currentCase.mode !== "challenge" ||
      remaining !== 0 ||
      found.size === currentCase.errors.length
    ) {
      return;
    }
    const timer = window.setTimeout(() => finishCase("time"), 0);
    return () => window.clearTimeout(timer);
  }, [currentCase, finishCase, found.size, remaining, screen]);

  useEffect(() => {
    if (screen !== "room") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "BUTTON" &&
        (event.key === "Enter" || event.key === " ")
      ) {
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? 1 : -1;
        setView((current) => ({
          ...current,
          x: clamp(
            current.x + direction * 1.4,
            -getHorizontalPanLimit(),
            getHorizontalPanLimit(),
          ),
        }));
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const direction = event.key === "ArrowUp" ? 1 : -1;
        setView((current) => ({
          ...current,
          y: clamp(current.y + direction, -7, 7),
        }));
      } else if (event.key === "+" || event.key === "=") {
        setView((current) => ({
          ...current,
          zoom: clamp(current.zoom + 0.12, 1.02, 1.8),
        }));
      } else if (event.key === "-" || event.key === "_") {
        setView((current) => ({
          ...current,
          zoom: clamp(current.zoom - 0.12, 1.02, 1.8),
        }));
      } else if (event.key.toLowerCase() === "r") {
        resetView();
      } else if (event.key.toLowerCase() === "f") {
        void toggleFullscreen();
      } else if (event.key.toLowerCase() === "v") {
        void toggleVrMode();
      } else if (event.key === "Escape") {
        setSelectedId(null);
        setHintText(null);
        if (vrMode) setVrMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resetView, screen, toggleFullscreen, toggleVrMode, vrMode]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    drag.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    if (activePointers.current.size === 2) {
      const points = [...activePointers.current.values()];
      pinch.current = {
        distance: Math.hypot(
          points[0].x - points[1].x,
          points[0].y - points[1].y,
        ),
        zoom: view.zoom,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !activePointers.current.has(event.pointerId))
      return;
    activePointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (
      Math.hypot(
        event.clientX - drag.current.startX,
        event.clientY - drag.current.startY,
      ) > 6
    ) {
      drag.current.moved = true;
    }

    if (activePointers.current.size === 2) {
      const points = [...activePointers.current.values()];
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y,
      );
      if (pinch.current.distance > 0) {
        setView((current) => ({
          ...current,
          zoom: clamp(
            pinch.current.zoom * (distance / pinch.current.distance),
            1.02,
            1.8,
          ),
        }));
      }
      return;
    }

    const dx = event.clientX - drag.current.lastX;
    const dy = event.clientY - drag.current.lastY;
    drag.current.lastX = event.clientX;
    drag.current.lastY = event.clientY;
    setView((current) => ({
      ...current,
      x: clamp(
        current.x + (dx / window.innerWidth) * 18,
        -getHorizontalPanLimit(),
        getHorizontalPanLimit(),
      ),
      y: clamp(current.y + (dy / window.innerHeight) * 12, -7, 7),
    }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activePointers.current.has(event.pointerId)) return;
    const wasClick =
      !drag.current.moved && activePointers.current.size === 1 && !vrMode;
    activePointers.current.delete(event.pointerId);

    if (wasClick) {
      markRoomClick(event.clientX, event.clientY);
    }

    if (activePointers.current.size === 1) {
      const remainingPointer = [...activePointers.current.values()][0];
      drag.current = {
        active: true,
        lastX: remainingPointer.x,
        lastY: remainingPointer.y,
        startX: remainingPointer.x,
        startY: remainingPointer.y,
        moved: false,
      };
    } else {
      drag.current.active = false;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setView((current) => ({
      ...current,
      zoom: clamp(current.zoom - event.deltaY * 0.0007, 1.02, 1.8),
    }));
  };

  const nextCase = () => {
    const currentIndex = CASES.findIndex((item) => item.id === currentCase.id);
    const next = CASES[currentIndex + 1];
    if (next) {
      selectCase(next.id);
    } else {
      setScreen("lobby");
    }
  };

  if (screen === "lobby") {
    return (
      <main className="lobby">
        <Image
          className="lobby-background"
          src="/assets/hospital-room-v3.webp"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
        />
        <div className="lobby-shade" />
        <header className="lobby-header">
          <div className="brand brand-static">
            <span className="brand-mark">N</span>
            <span>
              <b>Nursing Simulation Lab</b>
              <small>Interactive Room of Error</small>
            </span>
          </div>
          <span className="version-badge">4 CASES · 2.5D VR</span>
        </header>

        <section className="lobby-content">
          <div className="lobby-heading">
            <span className="eyebrow">PATIENT SAFETY SIMULATION</span>
            <h1>
              Room of Error
              <em>오류를 찾아 환자를 지켜주세요</em>
            </h1>
            <p>
              OT에서 조작법을 익힌 뒤 세 가지 임상사례에서 숨겨진
              환자안전 오류를 직접 찾아보세요.
            </p>
          </div>

          <div className="case-grid">
            {CASES.map((item) => (
              <button
                className={`case-card case-card-${item.id}`}
                key={item.id}
                type="button"
                onClick={() => selectCase(item.id)}
                style={{ "--case-color": item.color } as CSSProperties}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 800px) 84vw, 25vw"
                />
                <span className="case-card-shade" />
                <span className="case-card-top">
                  <b>{item.order}</b>
                  <em>{item.badge}</em>
                </span>
                <span className="case-card-copy">
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                  <span>
                    {item.mode === "tutorial"
                      ? "자율 연습"
                      : `${item.errors.length}개 오류 · ${Math.floor(item.timeLimit / 60)}분`}
                  </span>
                </span>
                <span className="case-card-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (screen === "briefing") {
    return (
      <main className="briefing-screen">
        <Image
          className="briefing-background"
          src={currentCase.image}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
        />
        <div className="briefing-shade" />
        <header className="briefing-header">
          <button
            className="back-button"
            type="button"
            onClick={() => setScreen("lobby")}
          >
            ← 사례 선택
          </button>
          <span>{currentCase.shortTitle}</span>
        </header>

        <section className="briefing-card">
          <div className="briefing-title">
            <span
              className="case-number"
              style={{ background: currentCase.color }}
            >
              {currentCase.order}
            </span>
            <span>
              <em>{currentCase.badge}</em>
              <h1>{currentCase.title}</h1>
            </span>
          </div>

          <div className="patient-strip">
            <span>
              <small>대상자</small>
              <b>{currentCase.patient}</b>
            </span>
            <span>
              <small>진단·상태</small>
              <b>{currentCase.diagnosis}</b>
            </span>
            <span>
              <small>활력징후</small>
              <b>{currentCase.vitals}</b>
            </span>
          </div>

          <div className="briefing-body">
            <div>
              <span className="section-label">상황 인계</span>
              <p>{currentCase.situation}</p>
              <div className="handoff-line">{currentCase.handoff}</div>
            </div>
            <div>
              <span className="section-label">학습 목표</span>
              <ul>
                {currentCase.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mission-bar">
            <span>
              <small>MISSION</small>
              <b>{currentCase.mission}</b>
            </span>
            <button type="button" onClick={startCase}>
              {currentCase.mode === "tutorial"
                ? "OT 시작하기"
                : "오류 찾기 시작"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result") {
    const grade =
      score >= 90
        ? "탁월"
        : score >= 80
          ? "우수"
          : score >= 70
            ? "보통"
            : "재도전";
    const resultTitle =
      resultReason === "complete"
        ? "모든 오류를 찾았습니다"
        : resultReason === "time"
          ? "제한시간이 종료되었습니다"
          : "결과를 제출했습니다";

    return (
      <main className="result-screen">
        <Image
          className="result-background"
          src={currentCase.image}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
        />
        <div className="result-shade" />
        <section className="result-card">
          <header className="result-summary">
            <div className="score-ring" style={{ "--score": score } as CSSProperties}>
              <span>
                <b>{score}</b>
                <small>점</small>
              </span>
            </div>
            <div>
              <span className="eyebrow">{currentCase.shortTitle}</span>
              <h1>{resultTitle}</h1>
              <p>
                평가 수준 <b>{grade}</b> · 찾은 오류 {found.size}/
                {currentCase.errors.length}
              </p>
              <div className="result-metrics">
                <span>
                  <small>오답 클릭</small>
                  <b>{wrongClicks}회</b>
                </span>
                <span>
                  <small>힌트 사용</small>
                  <b>{hintsUsed}회</b>
                </span>
                <span>
                  <small>소요 시간</small>
                  <b>{formatTime(elapsed)}</b>
                </span>
              </div>
            </div>
          </header>

          <div className="answer-review">
            <div className="answer-review-heading">
              <span className="section-label">정답 및 해설</span>
              <small>− 오답 3점 · 힌트 5점 · 미발견 10점</small>
            </div>
            <div className="answer-list">
              {currentCase.errors.map((item) => {
                const wasFound = found.has(item.id);
                return (
                  <article
                    className={wasFound ? "was-found" : "was-missed"}
                    key={item.id}
                  >
                    <span className="answer-status">
                      {wasFound ? "✓" : "!"}
                    </span>
                    <div>
                      <span>{item.category}</span>
                      <h2>{item.title}</h2>
                      <p>{item.explanation}</p>
                      <small>조치 · {item.action}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <footer className="result-actions">
            <button
              className="secondary-action"
              type="button"
              onClick={() => setScreen("lobby")}
            >
              사례 선택
            </button>
            <button
              className="secondary-action"
              type="button"
              onClick={startCase}
            >
              다시 도전
            </button>
            <button className="primary-action" type="button" onClick={nextCase}>
              {CASES.findIndex((item) => item.id === currentCase.id) <
              CASES.length - 1
                ? "다음 사례"
                : "학습 종료"}
              <span aria-hidden="true">→</span>
            </button>
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className="vr-app">
      <section
        ref={viewerRef}
        className={`viewer ${currentCase.mode === "challenge" ? "challenge-room" : "tutorial-room"} ${vrMode ? "is-stereo" : ""} ${reducedMotion ? "reduce-motion" : ""}`}
        aria-label={`${currentCase.shortTitle} 대화형 병실`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="ambient-light" aria-hidden="true" />
        <div ref={sceneRef} className="scene" style={sceneStyle}>
          <Image
            className="scene-image"
            src={currentCase.image}
            alt={`${currentCase.title} 병실 환경`}
            fill
            priority
            unoptimized
            sizes="100vw"
            draggable={false}
          />

          {currentCase.mode === "tutorial" && (
            <div
              className={`hotspot-layer ${markersVisible ? "" : "is-hidden"}`}
            >
              {TUTORIAL_POINTS.map((point) => (
                <button
                  className={`hotspot ${tutorialDone.has(point.id) ? "is-complete" : ""}`}
                  key={point.id}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: `translate(-50%, -50%) scale(${1 / view.zoom})`,
                  }}
                  type="button"
                  aria-label={`${point.id}. ${point.title} 살펴보기`}
                  aria-pressed={selectedId === point.id}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setSelectedId(point.id)}
                >
                  <span className="hotspot-ring" aria-hidden="true" />
                  <span className="hotspot-number">{point.id}</span>
                  <span className="hotspot-label">{point.title}</span>
                </button>
              ))}
            </div>
          )}

          {currentCase.mode === "challenge" && (
            <div className="found-layer">
              {currentCase.errors
                .filter((item) => found.has(item.id))
                .map((item) => (
                  <button
                    className="found-marker"
                    key={item.id}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / view.zoom})`,
                    }}
                    type="button"
                    aria-label={`발견한 오류 ${item.id}. ${item.title}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span>✓</span>
                    <small>{item.id}</small>
                  </button>
                ))}
              {missMarker && (
                <span
                  className="miss-marker"
                  key={missMarker.key}
                  style={{
                    left: `${missMarker.x}%`,
                    top: `${missMarker.y}%`,
                    transform: `translate(-50%, -50%) scale(${1 / view.zoom})`,
                  }}
                >
                  ×
                </span>
              )}
            </div>
          )}
        </div>

        {currentCase.mode === "tutorial" && (
          <nav
            className="tutorial-navigator"
            aria-label="OT 표식 바로가기"
          >
            <span>표식 바로가기</span>
            <div>
              {TUTORIAL_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={tutorialDone.has(point.id) ? "is-complete" : ""}
                  aria-label={`${point.id}번 ${point.title}로 이동`}
                  aria-current={selectedId === point.id ? "true" : undefined}
                  onClick={() => focusTutorialPoint(point)}
                >
                  {point.id}
                </button>
              ))}
            </div>
          </nav>
        )}

        {vrMode && (
          <div className="stereo-view" style={sceneStyle}>
            <div className="vr-eye vr-eye-left">
              <div
                className="vr-eye-image"
                style={{ backgroundImage: `url(${currentCase.image})` }}
              />
              <span className="vr-reticle" aria-hidden="true" />
            </div>
            <div className="vr-eye vr-eye-right">
              <div
                className="vr-eye-image"
                style={{ backgroundImage: `url(${currentCase.image})` }}
              />
              <span className="vr-reticle" aria-hidden="true" />
            </div>
            <div className="vr-divider" aria-hidden="true" />
            <div className="vr-status">
              <b>2.5D VR 관찰 모드</b>
              <span>오류 선택은 VR 모드를 종료한 뒤 진행하세요</span>
            </div>
            {!gyroEnabled && (
              <button
                className="vr-gyro-button"
                type="button"
                onClick={() => void enableGyro()}
              >
                기울기 보기 켜기
              </button>
            )}
            <button
              className="vr-exit-button"
              type="button"
              onClick={() => void toggleVrMode()}
            >
              VR 종료
            </button>
          </div>
        )}

        <div className="edge-vignette" aria-hidden="true" />

        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">{currentCase.order}</span>
            <span>
              <b>{currentCase.shortTitle}</b>
              <small>{currentCase.badge}</small>
            </span>
          </div>

          <div className="topbar-actions">
            {currentCase.mode === "challenge" && (
              <div
                className={`timer-pill ${remaining <= 60 ? "is-urgent" : ""}`}
                aria-label={`남은 시간 ${formatTime(remaining)}`}
              >
                <small>TIME</small>
                <b>{formatTime(remaining)}</b>
              </div>
            )}
            <div
              className="progress-pill"
              aria-label={`${completedCount}개 완료, 전체 ${totalTargets}개`}
            >
              <span className="progress-dot" />
              {currentCase.mode === "tutorial" ? "확인" : "발견"}{" "}
              {completedCount}/{totalTargets}
            </div>
            {currentCase.mode === "challenge" && (
              <div className="penalty-pill">오답 {wrongClicks}</div>
            )}
            <button
              className="glass-button"
              type="button"
              onClick={() => setBriefOpen((open) => !open)}
            >
              사례정보
            </button>
            {currentCase.mode === "tutorial" ? (
              <button
                className="glass-button"
                type="button"
                onClick={() => setMarkersVisible((visible) => !visible)}
              >
                {markersVisible ? "표식 숨기기" : "표식 보기"}
              </button>
            ) : (
              <button
                className="glass-button hint-button"
                type="button"
                onClick={revealHint}
              >
                힌트 −5
              </button>
            )}
            <button
              className="glass-button"
              type="button"
              onClick={() =>
                currentCase.mode === "challenge"
                  ? finishCase("submitted")
                  : setScreen("lobby")
              }
            >
              {currentCase.mode === "challenge" ? "제출" : "OT 종료"}
            </button>
          </div>
        </header>

        {briefOpen && (
          <aside className="case-info-panel">
            <button
              className="panel-close"
              type="button"
              aria-label="사례정보 닫기"
              onClick={() => setBriefOpen(false)}
            >
              ×
            </button>
            <span className="section-label">PATIENT BRIEF</span>
            <h2>{currentCase.patient}</h2>
            <b>{currentCase.diagnosis}</b>
            <p>{currentCase.situation}</p>
            <div>{currentCase.vitals}</div>
            <small>{currentCase.handoff}</small>
          </aside>
        )}

        {hintText && (
          <aside className="hint-panel" role="status">
            <span>힌트 {hintsUsed}</span>
            <p>{hintText}</p>
            <button type="button" onClick={() => setHintText(null)}>
              닫기
            </button>
          </aside>
        )}

        {(selectedTutorial || selectedError) && (
          <aside className="info-panel" aria-live="polite">
            <button
              className="panel-close"
              type="button"
              aria-label="설명 닫기"
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            {selectedTutorial && (
              <>
                <div className="panel-index">
                  <span>{String(selectedTutorial.id).padStart(2, "0")}</span>
                  {selectedTutorial.category}
                </div>
                <h2>{selectedTutorial.title}</h2>
                <p>{selectedTutorial.description}</p>
                <div className="check-card">
                  <span>간호 확인 포인트</span>
                  <p>{selectedTutorial.checkpoint}</p>
                </div>
                <button
                  className={`complete-button ${tutorialDone.has(selectedTutorial.id) ? "is-complete" : ""}`}
                  type="button"
                  onClick={() => completeTutorialPoint(selectedTutorial.id)}
                >
                  {tutorialDone.has(selectedTutorial.id)
                    ? "확인 완료 ✓"
                    : "확인 완료로 표시"}
                </button>
              </>
            )}
            {selectedError && (
              <>
                <div className="panel-index error-index">
                  <span>{String(selectedError.id).padStart(2, "0")}</span>
                  오류 발견 · {selectedError.category}
                </div>
                <h2>{selectedError.title}</h2>
                <p>{selectedError.explanation}</p>
                <div className="check-card error-action-card">
                  <span>즉시 필요한 간호</span>
                  <p>{selectedError.action}</p>
                </div>
                <button
                  className="complete-button is-complete"
                  type="button"
                  onClick={() => setSelectedId(null)}
                >
                  확인하고 계속 찾기
                </button>
              </>
            )}
          </aside>
        )}

        <nav className="mobile-case-actions" aria-label="사례 진행 도구">
          <button
            type="button"
            onClick={() => setBriefOpen((open) => !open)}
          >
            사례정보
          </button>
          {currentCase.mode === "tutorial" ? (
            <button
              type="button"
              onClick={() => setMarkersVisible((visible) => !visible)}
            >
              {markersVisible ? "표식 숨김" : "표식 보기"}
            </button>
          ) : (
            <button type="button" onClick={revealHint}>
              힌트 −5
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              currentCase.mode === "challenge"
                ? finishCase("submitted")
                : setScreen("lobby")
            }
          >
            {currentCase.mode === "challenge" ? "제출" : "OT 종료"}
          </button>
        </nav>

        <nav className="mode-dock" aria-label="몰입형 보기 설정">
          <button
            type="button"
            className={gyroEnabled ? "is-active" : ""}
            onClick={() => {
              if (gyroEnabled) {
                setGyroEnabled(false);
                setGyroOffset({ x: 0, y: 0 });
              } else {
                void enableGyro();
              }
            }}
          >
            {gyroEnabled ? "기울기 켜짐" : "기울여 보기"}
          </button>
          <button
            type="button"
            className={isFullscreen ? "is-active" : ""}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? "전체화면 종료" : "전체화면"}
          </button>
          <button
            type="button"
            className={vrMode ? "is-active" : ""}
            onClick={() => void toggleVrMode()}
          >
            VR 고글
          </button>
          <button
            type="button"
            className={reducedMotion ? "is-active" : ""}
            onClick={() => {
              setReducedMotion((current) => !current);
              if (!reducedMotion) {
                setGyroEnabled(false);
                setGyroOffset({ x: 0, y: 0 });
              }
            }}
          >
            모션 줄임
          </button>
        </nav>

        <div className="zoom-control" aria-label="화면 확대 조절">
          <button
            type="button"
            aria-label="축소"
            onClick={() =>
              setView((current) => ({
                ...current,
                zoom: clamp(current.zoom - 0.15, 1.02, 1.8),
              }))
            }
          >
            −
          </button>
          <span>{Math.round(view.zoom * 100)}%</span>
          <button
            type="button"
            aria-label="확대"
            onClick={() =>
              setView((current) => ({
                ...current,
                zoom: clamp(current.zoom + 0.15, 1.02, 1.8),
              }))
            }
          >
            +
          </button>
        </div>

        <div className="viewer-hint" aria-hidden="true">
          <span className="drag-symbol">↔</span>
          {currentCase.mode === "challenge"
            ? "드래그로 관찰 · 의심 지점을 클릭"
            : "아래 1–10 바로가기 또는 표식을 클릭"}
        </div>

        {feedback && (
          <div className={`feedback feedback-${feedback.kind}`} role="status">
            <span>
              {feedback.kind === "success"
                ? "✓"
                : feedback.kind === "miss"
                  ? "×"
                  : "i"}
            </span>
            {feedback.text}
          </div>
        )}
      </section>
    </main>
  );
}
