import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
	Button,
	CollapsibleSection,
	Row,
	Select,
	Stack,
	Swatch,
	Table,
	Text,
	Toggle,
	useCanvasState,
	useHostTheme,
	type Color,
} from 'cursor/canvas';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type Tile = { id: string; label: string; icon: IconKind; hint?: string };
type TextBlock = { id: string; text: string };
type DomainId = 'telecom' | 'cx' | 'vas';
type RacRole = 'R' | 'A' | 'C' | 'I' | '—';
type DirectionId = 'lead' | 'profit' | 'retention';

type IconKind =
	| 'grid'
	| 'catalog'
	| 'card'
	| 'cart'
	| 'sim'
	| 'phone'
	| 'home'
	| 'family'
	| 'chart'
	| 'wallet'
	| 'shield'
	| 'bell'
	| 'api'
	| 'search'
	| 'story'
	| 'user'
	| 'flag'
	| 'content'
	| 'partner'
	| 'ai'
	| 'game'
	| 'finance'
	| 'gift'
	| 'link'
	| 'auth'
	| 'analytics'
	| 'journey'
	| 'settings'
	| 'design'
	| 'access'
	| 'channel'
	| 'star'
	| 'layers';

type DomainConfig = {
	id: DomainId;
	cpoTitle: string;
	cpoSubtitle: string;
	platformTitle: string;
	platformOwner: string;
	color: Color;
	sections: Array<
		| { kind: 'tiles'; title: string; items: Tile[] }
		| { kind: 'text'; title: string; items: TextBlock[] }
	>;
};

type CpoRole = {
	id: string;
	label: string;
	domain: DomainId;
	teamIds: string[];
};

type ProductTeam = {
	id: string;
	label: string;
	direction: DirectionId;
};

const BUSINESS_LEADERS = [
	{ id: 'telecom-core', label: 'Бизнес лидер — Телеком Core' },
	{ id: 'vitriny', label: 'Бизнес лидер — Витрины' },
] as const;

const DIGITAL_CPO_TITLE = 'CPO Цифровой продукт МегаФона (Личный кабинет и Сайт)';

const BUSINESS_CONNECTION_METRICS = [
	{ label: 'AБПП', description: 'Активная база платящих пользователей' },
	{ label: 'GM', description: 'Gross Margin — валовая маржа' },
] as const;

type InteractionNodeId = 'leaders' | 'telecom-cpo' | 'digital-cpo' | 'platform-cpos' | 'processes';

type CpoRoleZoneId = 'digital' | 'telecom' | 'cx' | 'vas';

type CpoRoleZone = {
	id: CpoRoleZoneId;
	title: string;
	subtitle: string;
	ownership: string;
	color: Color;
	responsibilities: string[];
	kpis: string;
};

const CPO_ROLE_ZONES: CpoRoleZone[] = [
	{
		id: 'digital',
		title: 'CPO цифрового продукта',
		subtitle: 'Личный кабинет',
		ownership: 'Владелец всего цифрового продукта «Личный кабинет МегаФона и Сайт»',
		color: 'purple',
		responsibilities: [
			'Формирование и реализация продуктовой стратегии',
			'Управление инвестиционным портфелем и приоритетами',
			'Назначение и развитие CPO платформенных доменов',
			'Баланс интересов бизнеса, клиента и технологий',
			'Единые стандарты, процессы и качество продукта',
			'Общий результат и KPI продукта',
		],
		kpis: 'AБПП, GM, общий результат цифрового продукта',
	},
	{
		id: 'telecom',
		title: 'CPO Telecom Platform',
		subtitle: 'Телеком платформа',
		ownership: 'Владелец телеком-платформы и телеком-сценариев. Единая точка входа для бизнес-запросов',
		color: 'green',
		responsibilities: [
			'Развитие телеком-каталогов, карточек, поиска, навигации',
			'Сквозные телеком-сценарии (подключение, управление, семейная механика и др.)',
			'Сервисы платформы телеком (балансы, тарифы, номера, клоны, MegaInternet и др.)',
			'Техническое и продуктовое развитие домена',
		],
		kpis: 'AБПП, GM телеком сценариев, конверсии в воронках телекома, TTM, CSI телеком сценариев, MEU телеком платформы',
	},
	{
		id: 'cx',
		title: 'CPO CX Platform',
		subtitle: 'CX платформа',
		ownership: 'Владелец платформы клиентского опыта',
		color: 'blue',
		responsibilities: [
			'Клиентский опыт, профиль, настройки, персонализация',
			'Коммуникации, уведомления, обратная связь',
			'Design system, UI-компоненты, общие CX-сервисы',
			'Сквозная механика для всех доменов',
		],
		kpis: 'MEU, CSI',
	},
	{
		id: 'vas',
		title: 'CPO VAS Platform',
		subtitle: 'VAS платформа',
		ownership: 'Владелец VAS-платформы и партнёрских сервисов',
		color: 'orange',
		responsibilities: [
			'Категории VAS и витрины, партнёрские сервисы',
			'Партнёрские интеграции и управление цифровой частью партнёрств',
			'Сервисы VAS-платформы (кошелёк, подписки, контент и др.)',
		],
		kpis: 'Выручка VAS, конверсия, партнёрские метрики',
	},
];

const zoneById = (id: CpoRoleZoneId) => CPO_ROLE_ZONES.find((z) => z.id === id)!;

const INTERACTION_FLOW_STEPS: Array<{
	id: InteractionNodeId;
	title: string;
	subtitle?: string;
	color: Color;
	items: string[];
}> = [
	{
		id: 'leaders',
		title: 'Бизнес лидеры',
		subtitle: 'Телеком Core, Витрины',
		color: 'green',
		items: ['Запросы и цели', 'Приоритеты бизнеса', 'KPI и результат (AБПП, GM)'],
	},
	{
		id: 'telecom-cpo',
		title: 'CPO Telecom Platform',
		subtitle: 'Телеком платформа',
		color: 'green',
		items: [
			'Анализ запросов',
			'Формирование roadmap телеком-платформы',
			'Приоритизация инициатив',
			'Синхронизация со стратегией витрины',
			'Передача в портфель цифрового продукта',
		],
	},
	{
		id: 'digital-cpo',
		title: 'CPO цифрового продукта',
		subtitle: 'Личный кабинет',
		color: 'purple',
		items: zoneById('digital').responsibilities.slice(0, 5),
	},
	{
		id: 'platform-cpos',
		title: 'Платформенные CPO',
		subtitle: 'Доменные владельцы',
		color: 'purple',
		items: [
			'Развитие доменов и команд',
			'Доставка ценности',
			'Достижение KPI домена',
			'Синхронизация между доменами',
		],
	},
	{
		id: 'processes',
		title: 'Совместные процессы',
		color: 'purple',
		items: [
			'Планирование (квартальное)',
			'Синхронизация (месячная)',
			'Agile-ритмы (спринты)',
			'Review и ретроспективы',
		],
	},
];

const DOMAIN_TO_ZONE: Record<DomainId, CpoRoleZoneId> = {
	telecom: 'telecom',
	cx: 'cx',
	vas: 'vas',
};

const CPO_ROLES: CpoRole[] = [
	{ id: 'cpo-main', label: 'CPO основная линейка', domain: 'telecom', teamIds: ['tariffs'] },
	{ id: 'cpo-persona', label: 'CPO — Персона', domain: 'telecom', teamIds: ['persona'] },
	{ id: 'cpo-mnp', label: 'CPO — MNP, клоны, SIM', domain: 'telecom', teamIds: ['subscriber'] },
	{ id: 'cpo-megainternet', label: 'CPO — МегаИнтернет', domain: 'telecom', teamIds: ['mega-internet'] },
	{ id: 'cpo-home', label: 'CPO — Доминтернет', domain: 'telecom', teamIds: ['home-internet'] },
	{ id: 'cpo-monetization', label: 'CPO — Монетизация', domain: 'telecom', teamIds: ['monetization'] },
];

const DIRECTIONS: Array<{ id: DirectionId; label: string }> = [
	{ id: 'lead', label: 'Лид генераторы' },
	{ id: 'profit', label: 'Профит генераторы' },
	{ id: 'retention', label: 'Удержание' },
];

const PRODUCT_TEAMS: ProductTeam[] = [
	{ id: 'tariffs', label: 'Витрины Тарифов', direction: 'profit' },
	{ id: 'subscriber', label: 'Стать абонентом', direction: 'lead' },
	{ id: 'home-internet', label: 'Домашний интернет', direction: 'lead' },
	{ id: 'monetization', label: 'Монетизация ЛК и самообслуживание', direction: 'retention' },
	{ id: 'persona', label: 'Персона — ДГП', direction: 'lead' },
	{ id: 'mega-internet', label: 'Mega Интернет и контроль расходов', direction: 'retention' },
];

const DOMAINS: DomainConfig[] = [
	{
		id: 'telecom',
		cpoTitle: 'CPO TELECOM CORE',
		cpoSubtitle: 'БИЗНЕС — владелец телеком-продуктов и P&L',
		platformTitle: 'ТЕЛЕКОМ ПЛАТФОРМА',
		platformOwner: zoneById('telecom').ownership,
		color: 'green',
		sections: [
			{
				kind: 'tiles',
				title: 'ВИТРИНЫ И НАВИГАЦИЯ ТЕЛЕКОМ',
				items: [
					{ id: 't1', label: 'Сквозные элементы', icon: 'grid', hint: 'Единая навигация телеком-разделов' },
					{ id: 't2', label: 'Каталоги тарифов', icon: 'catalog', hint: 'Каталоги и полки тарифных планов' },
					{ id: 't3', label: 'Карточки тарифов', icon: 'card', hint: 'Детальные карточки тарифов' },
					{ id: 't4', label: 'Карточки услуг', icon: 'card', hint: 'Карточки подключаемых услуг' },
					{ id: 't5', label: 'Полки', icon: 'layers', hint: 'Полки и подборки продуктов' },
					{ id: 't6', label: 'Корзина телеком', icon: 'cart', hint: 'Оформление телеком-заказов' },
				],
			},
			{
				kind: 'tiles',
				title: 'ОСНОВНЫЕ ТЕЛЕКОМ-СЦЕНАРИИ',
				items: [
					{ id: 't7', label: 'SIM / eSIM', icon: 'sim', hint: 'Покупка и активация SIM / eSIM' },
					{ id: 't8', label: 'MNP', icon: 'phone', hint: 'Перенос номера от другого оператора' },
					{ id: 't9', label: 'Консьерж', icon: 'user', hint: 'Персональное сопровождение' },
					{ id: 't10', label: 'Подключение услуг', icon: 'link', hint: 'Подключение и управление услугами' },
					{ id: 't11', label: 'Домашний интернет', icon: 'home', hint: 'Подключение и управление ДИ' },
					{ id: 't12', label: 'ДГП', icon: 'family', hint: 'Семейные тарифы и сценарии' },
					{ id: 't13', label: 'Счётчики ГБ / мин', icon: 'chart', hint: 'Остатки пакетов и лимитов' },
					{ id: 't14', label: 'Расходы', icon: 'wallet', hint: 'Детализация расходов абонента' },
					{ id: 't15', label: 'Абонплата', icon: 'wallet', hint: 'Управление абонентской платой' },
					{ id: 't16', label: 'Контроль расходов', icon: 'chart', hint: 'Лимиты и контроль трат' },
					{ id: 't17', label: 'Минимальная корзина', icon: 'cart', hint: 'Минимальный набор для подключения' },
					{ id: 't18', label: 'МегаСилы', icon: 'star', hint: 'Бонусы и дополнительные возможности' },
					{ id: 't19', label: 'Смена тарифа', icon: 'card', hint: 'Смена тарифного плана абонента' },
					{ id: 't20', label: 'Клонирование', icon: 'layers', hint: 'Клонирование номера и SIM' },
				],
			},
			{
				kind: 'text',
				title: 'СЕРВИСЫ ПЛАТФОРМЫ ТЕЛЕКОМ',
				items: [
					{ id: 'tt1', text: 'Услуги подкл/отключ.' },
					{ id: 'tt2', text: 'Импортер' },
					{ id: 'tt3', text: 'Домашний инет' },
					{ id: 'tt4', text: 'Проверка адреса - мск (dadata)' },
					{ id: 'tt5', text: 'Проверка баланса' },
					{ id: 'tt6', text: 'Мои номера' },
					{ id: 'tt7', text: 'Тарифы' },
					{ id: 'tt8', text: 'Клоны' },
					{ id: 'tt9', text: 'Семья' },
				],
			},
		],
	},
	{
		id: 'cx',
		cpoTitle: 'CPO CX',
		cpoSubtitle: 'КРОСС-ДОМЕН — клиентский опыт и взаимодействие',
		platformTitle: 'CX ПЛАТФОРМА',
		platformOwner: zoneById('cx').ownership,
		color: 'blue',
		sections: [
			{
				kind: 'tiles',
				title: 'КЛИЕНТСКИЙ ОПЫТ И ВЗАИМОДЕЙСТВИЕ',
				items: [
					{ id: 'c1', label: 'Главная и навигация', icon: 'grid', hint: 'Главный экран и навигация ЛК' },
					{ id: 'c2', label: 'Профиль клиента', icon: 'user', hint: 'Единый профиль абонента' },
					{ id: 'c3', label: 'Поиск', icon: 'search', hint: 'Глобальный поиск по ЛК' },
					{ id: 'c4', label: 'Push / уведомления', icon: 'bell', hint: 'Push и in-app уведомления' },
					{ id: 'c5', label: 'Stories и контент', icon: 'story', hint: 'Контентные блоки и stories' },
					{ id: 'c6', label: 'Onboarding', icon: 'flag', hint: 'Онбординг новых пользователей' },
					{ id: 'c7', label: 'Персонализация', icon: 'star', hint: 'Персонализированный опыт' },
					{ id: 'c8', label: 'Feedback', icon: 'chart', hint: 'Обратная связь и опросы' },
					{ id: 'c9', label: 'UI Components', icon: 'design', hint: 'Design system и UI-kit' },
				],
			},
			{
				kind: 'tiles',
				title: 'СЕРВИСЫ CX ПЛАТФОРМЫ',
				items: [
					{ id: 'c10', label: 'Auth & Profile', icon: 'auth', hint: 'Авторизация и профиль' },
					{ id: 'c11', label: 'Notifications', icon: 'bell', hint: 'Центр уведомлений' },
					{ id: 'c12', label: 'Communications', icon: 'link', hint: 'Коммуникации с клиентом' },
					{ id: 'c13', label: 'Analytics & Events', icon: 'analytics', hint: 'Событийная аналитика' },
					{ id: 'c14', label: 'A/B эксперименты', icon: 'flag', hint: 'Эксперименты и feature flags' },
					{ id: 'c15', label: 'Feature Flags', icon: 'settings', hint: 'Управление флагами' },
					{ id: 'c16', label: 'Content Management', icon: 'content', hint: 'CMS и контент' },
				],
			},
			{
				kind: 'text',
				title: 'ЕДИНЫЕ ПРИНЦИПЫ CX',
				items: [
					{ id: 'ct1', text: 'Единые сценарии взаимодействия' },
					{ id: 'ct2', text: 'Единый визуальный язык / design system' },
					{ id: 'ct3', text: 'Доступность и юзабилити' },
					{ id: 'ct4', text: 'Омниканальность' },
					{ id: 'ct5', text: 'Персонализированный опыт' },
					{ id: 'ct6', text: 'Измерение удовлетворённости' },
				],
			},
		],
	},
	{
		id: 'vas',
		cpoTitle: 'CPO VAS / PARTNERS',
		cpoSubtitle: 'БИЗНЕС — VAS-направления и партнёрские сервисы',
		platformTitle: 'VAS ПЛАТФОРМА',
		platformOwner: zoneById('vas').ownership,
		color: 'orange',
		sections: [
			{
				kind: 'tiles',
				title: 'КАТЕГОРИИ VAS И ПАРТНЁРСКИХ СЕРВИСОВ',
				items: [
					{ id: 'v1', label: 'Роуминг', icon: 'phone', hint: 'Роуминговые продукты' },
					{ id: 'v2', label: 'EVA (AI)', icon: 'ai', hint: 'AI-ассистент и сервисы' },
					{ id: 'v3', label: 'Кино / игры', icon: 'game', hint: 'Развлекательные сервисы' },
					{ id: 'v4', label: 'Финансы', icon: 'finance', hint: 'Финансовые продукты' },
					{ id: 'v5', label: 'Cashback', icon: 'gift', hint: 'Кэшбэк и бонусы' },
					{ id: 'v6', label: 'Партнёрские сервисы', icon: 'partner', hint: 'Сторонние интеграции' },
				],
			},
			{
				kind: 'tiles',
				title: 'СЕРВИСЫ VAS ПЛАТФОРМЫ',
				items: [
					{ id: 'v7', label: 'Каталог сервисов', icon: 'catalog', hint: 'Каталог VAS-продуктов' },
					{ id: 'v8', label: 'Карточка сервиса', icon: 'card', hint: 'Карточка партнёрского сервиса' },
					{ id: 'v9', label: 'Подключение VAS', icon: 'link', hint: 'Подключение и активация' },
					{ id: 'v10', label: 'Управление подписками', icon: 'settings', hint: 'Подписки и отключение' },
					{ id: 'v11', label: 'Billing & Payments', icon: 'wallet', hint: 'Оплата VAS-услуг' },
					{ id: 'v12', label: 'Баланс и пополнение', icon: 'wallet', hint: 'Баланс и пополнение счёта' },
					{ id: 'v13', label: 'Partner Integrations', icon: 'partner', hint: 'API партнёров' },
					{ id: 'v14', label: 'Отчёты / история', icon: 'chart', hint: 'История подключений' },
				],
			},
			{
				kind: 'text',
				title: 'ЕДИНЫЙ ОПЫТ VAS',
				items: [
					{ id: 'vt1', text: 'Единая навигация и сценарии' },
					{ id: 'vt2', text: 'Единый профиль и настройки' },
					{ id: 'vt3', text: 'Персонализация предложений' },
					{ id: 'vt4', text: 'Единые коммуникации' },
					{ id: 'vt5', text: 'Прозрачность условий и цены' },
					{ id: 'vt6', text: 'Измерение эффективности' },
				],
			},
		],
	},
];

const INTEGRATION_TILES: Tile[] = [
	{ id: 'i1', label: 'Unified Auth', icon: 'auth', hint: 'Единая авторизация' },
	{ id: 'i2', label: 'Unified Notifications', icon: 'bell', hint: 'Единый центр уведомлений' },
	{ id: 'i3', label: 'Unified Billing', icon: 'wallet', hint: 'Единый биллинг' },
	{ id: 'i4', label: 'Cross-analytics', icon: 'analytics', hint: 'Сквозная аналитика' },
	{ id: 'i5', label: 'Data Exchange', icon: 'link', hint: 'Обмен данными между платформами' },
	{ id: 'i6', label: 'Unified Standards / API', icon: 'api', hint: 'Общие API и стандарты' },
	{ id: 'i7', label: 'Journey Sync', icon: 'journey', hint: 'Синхронизация клиентских путей' },
];

const RACI_ROWS = [
	{ area: 'P&L домена', telecom: 'A', cx: 'A', vas: 'A', platform: 'C', product: 'R' },
	{ area: 'Roadmap продукта', telecom: 'A', cx: 'A', vas: 'A', platform: 'C', product: 'R' },
	{ area: 'Платформенные стандарты', telecom: 'C', cx: 'C', vas: 'C', platform: 'R', product: 'I' },
	{ area: 'Design System', telecom: 'C', cx: 'A', vas: 'C', platform: 'R', product: 'I' },
	{ area: 'Auth & Profile', telecom: 'C', cx: 'A', vas: 'C', platform: 'R', product: 'I' },
	{ area: 'Биллинг и платежи', telecom: 'A', cx: 'C', vas: 'C', platform: 'R', product: 'I' },
	{ area: 'VAS-каталог', telecom: 'C', cx: 'C', vas: 'A', platform: 'R', product: 'I' },
	{ area: 'A/B и feature flags', telecom: 'I', cx: 'A', vas: 'I', platform: 'R', product: 'C' },
	{ area: 'Сквозная аналитика', telecom: 'C', cx: 'A', vas: 'C', platform: 'R', product: 'I' },
	{ area: 'Интеграция платформ', telecom: 'C', cx: 'C', vas: 'C', platform: 'A', product: 'I' },
] as const;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function TileIcon({ kind, color }: { kind: IconKind; color: string }) {
	const s = { stroke: color, strokeWidth: 1.4, fill: 'none' as const };
	const paths: Record<IconKind, ReactNode> = {
		grid: (
			<>
				<rect x="3" y="3" width="7" height="7" {...s} />
				<rect x="14" y="3" width="7" height="7" {...s} />
				<rect x="3" y="14" width="7" height="7" {...s} />
				<rect x="14" y="14" width="7" height="7" {...s} />
			</>
		),
		catalog: <path d="M4 6h16M4 12h16M4 18h10" {...s} />,
		card: <rect x="4" y="6" width="16" height="12" rx="2" {...s} />,
		cart: (
			<>
				<path d="M4 6h2l2 10h10l2-8H8" {...s} />
				<circle cx="10" cy="20" r="1.5" fill={color} />
				<circle cx="17" cy="20" r="1.5" fill={color} />
			</>
		),
		sim: <rect x="6" y="4" width="12" height="16" rx="2" {...s} />,
		phone: <rect x="8" y="3" width="8" height="18" rx="2" {...s} />,
		home: (
			<>
				<path d="M4 12l8-7 8 7" {...s} />
				<rect x="7" y="12" width="10" height="9" {...s} />
			</>
		),
		family: (
			<>
				<circle cx="9" cy="9" r="2.5" {...s} />
				<circle cx="17" cy="9" r="2.5" {...s} />
				<path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M14 20c0-3 2-5 4.5-5" {...s} />
			</>
		),
		chart: (
			<>
				<path d="M4 20V8M4 20h16" {...s} />
				<path d="M8 16l4-5 3 3 5-7" {...s} />
			</>
		),
		wallet: (
			<>
				<rect x="3" y="7" width="18" height="12" rx="2" {...s} />
				<circle cx="16" cy="13" r="1.5" fill={color} />
			</>
		),
		shield: <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" {...s} />,
		bell: (
			<>
				<path d="M12 4a5 5 0 00-5 5v4l-2 2h14l-2-2V9a5 5 0 00-5-5z" {...s} />
				<path d="M10 20a2 2 0 004 0" {...s} />
			</>
		),
		api: (
			<>
				<circle cx="6" cy="12" r="2" {...s} />
				<circle cx="18" cy="6" r="2" {...s} />
				<circle cx="18" cy="18" r="2" {...s} />
				<path d="M8 11l8-4M8 13l8 4" {...s} />
			</>
		),
		search: (
			<>
				<circle cx="10" cy="10" r="5" {...s} />
				<path d="M14 14l5 5" {...s} />
			</>
		),
		story: <rect x="5" y="4" width="14" height="16" rx="3" {...s} />,
		user: (
			<>
				<circle cx="12" cy="8" r="3" {...s} />
				<path d="M5 21c0-4 3-7 7-7s7 3 7 7" {...s} />
			</>
		),
		flag: (
			<>
				<path d="M5 4v16" {...s} />
				<path d="M5 4h12l-3 4 3 4H5" {...s} />
			</>
		),
		content: (
			<>
				<rect x="4" y="5" width="16" height="14" rx="2" {...s} />
				<path d="M8 10h8M8 14h5" {...s} />
			</>
		),
		partner: (
			<>
				<circle cx="8" cy="12" r="3" {...s} />
				<circle cx="16" cy="12" r="3" {...s} />
				<path d="M11 12h2" {...s} />
			</>
		),
		ai: (
			<>
				<rect x="5" y="8" width="14" height="10" rx="2" {...s} />
				<circle cx="9" cy="13" r="1" fill={color} />
				<circle cx="15" cy="13" r="1" fill={color} />
			</>
		),
		game: (
			<>
				<rect x="4" y="9" width="16" height="8" rx="3" {...s} />
				<path d="M9 13v4M7 15h4" {...s} />
				<circle cx="16" cy="14" r="1" fill={color} />
				<circle cx="18" cy="16" r="1" fill={color} />
			</>
		),
		finance: (
			<>
				<path d="M12 3v18" {...s} />
				<path d="M7 7h7a3 3 0 010 6H7a3 3 0 000 6h10" {...s} />
			</>
		),
		gift: (
			<>
				<rect x="4" y="10" width="16" height="10" {...s} />
				<path d="M12 10V20M4 10h16M12 10c-2-3-5-2-5 0s3 2 5 0 5 2 5 0-3-2-5 0" {...s} />
			</>
		),
		link: (
			<>
				<path d="M9 15l6-6M10 9h4v4" {...s} />
				<path d="M8 16a3 3 0 01-4-4l2-2a3 3 0 014 0" {...s} />
				<path d="M16 8a3 3 0 014 4l-2 2a3 3 0 01-4 0" {...s} />
			</>
		),
		auth: (
			<>
				<rect x="6" y="11" width="12" height="9" rx="2" {...s} />
				<path d="M9 11V9a3 3 0 116 0v2" {...s} />
			</>
		),
		analytics: (
			<>
				<path d="M4 20h16" {...s} />
				<rect x="6" y="12" width="3" height="8" {...s} />
				<rect x="11" y="8" width="3" height="12" {...s} />
				<rect x="16" y="14" width="3" height="6" {...s} />
			</>
		),
		journey: (
			<>
				<circle cx="5" cy="12" r="2" {...s} />
				<circle cx="12" cy="6" r="2" {...s} />
				<circle cx="19" cy="12" r="2" {...s} />
				<circle cx="12" cy="18" r="2" {...s} />
				<path d="M7 11l3-4M14 8l3 3M14 16l3-3M7 13l3 4" {...s} />
			</>
		),
		settings: (
			<>
				<circle cx="12" cy="12" r="3" {...s} />
				<path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" {...s} />
			</>
		),
		design: (
			<>
				<circle cx="8" cy="10" r="2" {...s} />
				<circle cx="14" cy="8" r="2" {...s} />
				<circle cx="16" cy="14" r="2" {...s} />
			</>
		),
		access: <circle cx="12" cy="12" r="8" {...s} />,
		channel: (
			<>
				<rect x="3" y="6" width="8" height="12" rx="1" {...s} />
				<rect x="13" y="6" width="8" height="12" rx="1" {...s} />
			</>
		),
		star: <path d="M12 4l2.2 5.5L20 10l-4.5 3.5L16.5 20 12 16.5 7.5 20l1-6.5L4 10l5.8-.5z" {...s} />,
		layers: (
			<>
				<path d="M4 8l8-4 8 4-8 4z" {...s} />
				<path d="M4 14l8 4 8-4" {...s} />
			</>
		),
	};
	return (
		<svg width={24} height={24} viewBox="0 0 24 24" aria-hidden>
			{paths[kind]}
		</svg>
	);
}

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

function useDomainStyles(color: Color) {
	const theme = useHostTheme();
	const accent = theme.category[color];
	return {
		accent,
		headerBg: theme.fill.secondary,
		columnBg: theme.fill.quaternary,
		sectionBg: theme.bg.elevated,
		border: theme.stroke.secondary,
		text: theme.text.primary,
		subtext: theme.text.secondary,
	};
}

function PanelBox({
	title,
	children,
	style,
	titleStyle,
}: {
	title?: string;
	children: ReactNode;
	style?: CSSProperties;
	titleStyle?: CSSProperties;
}) {
	const theme = useHostTheme();
	return (
		<div
			style={{
				border: `1px solid ${theme.stroke.secondary}`,
				borderRadius: 6,
				background: theme.bg.elevated,
				overflow: 'hidden',
				...style,
			}}
		>
			{title && (
				<div
					style={{
						padding: '6px 10px',
						fontSize: 11,
						fontWeight: 600,
						letterSpacing: '0.02em',
						borderBottom: `1px solid ${theme.stroke.tertiary}`,
						background: theme.fill.quaternary,
						...titleStyle,
					}}
				>
					{title}
				</div>
			)}
			<div style={{ padding: 10 }}>{children}</div>
		</div>
	);
}

function FlowArrow({
	label,
	active,
	horizontal,
}: {
	label?: string;
	active?: boolean;
	horizontal?: 'left' | 'right';
}) {
	const theme = useHostTheme();
	const stroke = active ? theme.accent.primary : theme.stroke.primary;

	if (horizontal) {
		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
				{label && (
					<Text size="small" weight="semibold" style={{ color: active ? theme.accent.primary : theme.text.secondary }}>
						{label}
					</Text>
				)}
				<svg width={horizontal === 'right' ? 48 : 48} height={20} viewBox="0 0 48 20" aria-hidden>
					{horizontal === 'right' ? (
						<path d="M2 10h36M38 10l-6-6M38 10l-6 6" stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					) : (
						<path d="M46 10H10M8 10l6-6M8 10l6 6" stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					)}
				</svg>
			</div>
		);
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0' }}>
			{label && (
				<Text size="small" weight="semibold" style={{ color: active ? theme.accent.primary : theme.text.secondary }}>
					{label}
				</Text>
			)}
			<svg width={28} height={36} viewBox="0 0 28 36" aria-hidden>
				<path
					d="M14 2v26M14 28l-8-8M14 28l8-8"
					stroke={stroke}
					strokeWidth={2}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

function BusinessLeaderPill({
	label,
	active,
	onHover,
}: {
	label: string;
	active: boolean;
	onHover: (hovering: boolean) => void;
}) {
	const theme = useHostTheme();
	return (
		<div
			onMouseEnter={() => onHover(true)}
			onMouseLeave={() => onHover(false)}
			style={{
				padding: '10px 16px',
				borderRadius: 20,
				fontSize: 11,
				fontWeight: 600,
				background: theme.category.blue,
				color: theme.text.onAccent,
				border: `2px solid ${active ? theme.text.onAccent : 'transparent'}`,
				outline: active ? `1px solid ${theme.category.blue}` : 'none',
				transition: 'border-color 0.15s',
				textAlign: 'center',
			}}
		>
			{label}
		</div>
	);
}

function VitrinyToDigitalCpoArrow({ active }: { active: boolean }) {
	const theme = useHostTheme();
	const stroke = active ? theme.category.blue : theme.stroke.primary;
	return (
		<div style={{ position: 'relative', height: 64, margin: '2px 0 6px' }}>
			<svg width="100%" height="64" viewBox="0 0 900 64" preserveAspectRatio="xMidYMid meet" aria-hidden>
				<path
					d="M675 2 L675 24 L450 24 L450 58 M450 58 l-7-7 M450 58 l7-7"
					stroke={stroke}
					strokeWidth={2.5}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M675 2 L675 24"
					stroke={stroke}
					strokeWidth={2.5}
					fill="none"
					strokeLinecap="round"
				/>
			</svg>
			<div
				style={{
					position: 'absolute',
					right: '24%',
					top: 4,
					fontSize: 10,
					fontWeight: 700,
					color: active ? theme.category.blue : theme.text.secondary,
					letterSpacing: '0.02em',
				}}
			>
				управляет
			</div>
		</div>
	);
}

function DigitalProductCpoHeader({ highlighted }: { highlighted: boolean }) {
	const theme = useHostTheme();
	return (
		<div
			style={{
				padding: '12px 20px',
				borderRadius: 6,
				background: theme.accent.control,
				color: theme.text.onAccent,
				textAlign: 'center',
				border: `2px solid ${highlighted ? theme.text.onAccent : 'transparent'}`,
				transition: 'border-color 0.2s',
			}}
		>
			<div style={{ fontSize: 16, fontWeight: 700 }}>{DIGITAL_CPO_TITLE}</div>
			<div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>Платформа</div>
		</div>
	);
}

function IconTile({
	tile,
	accent,
	selected,
	dimmed,
	onSelect,
	onHover,
}: {
	tile: Tile;
	accent: string;
	selected: boolean;
	dimmed: boolean;
	onSelect: () => void;
	onHover: (hovering: boolean) => void;
}) {
	const theme = useHostTheme();
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			onClick={onSelect}
			onMouseEnter={() => {
				setHover(true);
				onHover(true);
			}}
			onMouseLeave={() => {
				setHover(false);
				onHover(false);
			}}
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				gap: 4,
				padding: '8px 4px',
				minHeight: 72,
				width: '100%',
				border: `1px solid ${selected ? accent : hover ? theme.stroke.primary : theme.stroke.tertiary}`,
				borderRadius: 4,
				background: selected ? theme.fill.secondary : hover ? theme.fill.quaternary : theme.bg.elevated,
				cursor: 'pointer',
				color: theme.text.primary,
				opacity: dimmed ? 0.45 : 1,
				transition: 'opacity 0.15s, border-color 0.15s, background 0.15s',
			}}
		>
			<TileIcon kind={tile.icon} color={accent} />
			<span style={{ fontSize: 10, lineHeight: '13px', textAlign: 'center', color: theme.text.secondary }}>
				{tile.label}
			</span>
		</button>
	);
}

function TileGrid({
	tiles,
	accent,
	columns,
	selectedId,
	dimmed,
	onSelect,
	onHover,
}: {
	tiles: Tile[];
	accent: string;
	columns: number;
	selectedId: string | null;
	dimmed: boolean;
	onSelect: (id: string) => void;
	onHover: (tile: Tile | null) => void;
}) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 6 }}>
			{tiles.map((tile) => (
				<div key={tile.id}>
					<IconTile
						tile={tile}
						accent={accent}
						selected={selectedId === tile.id}
						dimmed={dimmed}
						onSelect={() => onSelect(tile.id)}
						onHover={(h) => onHover(h ? tile : null)}
					/>
				</div>
			))}
		</div>
	);
}

const DOMAIN_TILE_COLUMNS = 3;

function DomainColumn({
	domain,
	selectedId,
	activeDomain,
	selectedCpo,
	onSelect,
	onHoverTile,
	onActivate,
}: {
	domain: DomainConfig;
	selectedId: string | null;
	activeDomain: DomainId | null;
	selectedCpo: string | null;
	onSelect: (id: string) => void;
	onHoverTile: (tile: Tile | null) => void;
	onActivate: (id: DomainId | null) => void;
}) {
	const ds = useDomainStyles(domain.color);
	const theme = useHostTheme();
	const cpoActive = selectedCpo ? CPO_ROLES.find((c) => c.id === selectedCpo)?.domain === domain.id : false;
	const isHighlighted = activeDomain === domain.id || cpoActive;
	const isDimmed = (activeDomain !== null && activeDomain !== domain.id) || (selectedCpo !== null && !cpoActive);

	return (
		<div
			onMouseEnter={() => onActivate(domain.id)}
			onMouseLeave={() => onActivate(null)}
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
				width: '100%',
				minWidth: 0,
				boxSizing: 'border-box',
				background: ds.columnBg,
				border: `1px solid ${isHighlighted ? ds.accent : ds.border}`,
				borderTop: `3px solid ${ds.accent}`,
				borderRadius: 6,
				padding: 8,
				opacity: isDimmed ? 0.42 : 1,
				transition: 'opacity 0.2s, border-color 0.2s',
			}}
		>
			<div
				style={{
					padding: '8px 10px',
					borderRadius: 4,
					background: ds.headerBg,
					border: `1px solid ${ds.accent}`,
					minHeight: 52,
				}}
			>
				<div style={{ fontSize: 12, fontWeight: 700, color: ds.accent, wordBreak: 'break-word' }}>{domain.cpoTitle}</div>
				<div style={{ fontSize: 10, color: ds.subtext, marginTop: 2, wordBreak: 'break-word' }}>{domain.cpoSubtitle}</div>
			</div>

			<div
				style={{
					padding: '6px 10px',
					borderRadius: 4,
					background: ds.sectionBg,
					border: `1px solid ${ds.border}`,
					textAlign: 'center',
					minHeight: 56,
				}}
			>
				<div style={{ fontSize: 11, fontWeight: 700, color: ds.accent, wordBreak: 'break-word' }}>{domain.platformTitle}</div>
				<div style={{ fontSize: 9, color: ds.subtext, marginTop: 2, lineHeight: '13px', wordBreak: 'break-word' }}>
					{domain.platformOwner}
				</div>
			</div>

			{domain.sections.map((section) => (
				<div key={section.title}>
				<PanelBox
					title={section.title}
					titleStyle={{ color: ds.accent, background: ds.columnBg }}
					style={{ background: ds.sectionBg }}
				>
					{section.kind === 'tiles' ? (
						<TileGrid
							tiles={section.items}
							accent={ds.accent}
							columns={DOMAIN_TILE_COLUMNS}
							selectedId={selectedId}
							dimmed={isDimmed}
							onSelect={onSelect}
							onHover={onHoverTile}
						/>
					) : (
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
							{section.items.map((item) => (
								<div
									key={item.id}
									style={{
										padding: '6px 8px',
										fontSize: 10,
										lineHeight: '14px',
										borderRadius: 4,
										border: `1px solid ${ds.border}`,
										background: ds.columnBg,
										color: ds.subtext,
										opacity: isDimmed ? 0.6 : 1,
										wordBreak: 'break-word',
										minWidth: 0,
									}}
								>
									{item.text}
								</div>
							))}
						</div>
					)}
				</PanelBox>
				</div>
			))}

			{domain.id === 'telecom' && selectedCpo && (
				<div
					style={{
						padding: '6px 8px',
						borderRadius: 4,
						border: `1px dashed ${theme.category.yellow}`,
						textAlign: 'center',
					}}
				>
					<Text size="small" tone="tertiary">
						Связь с командами ↓
					</Text>
				</div>
			)}
		</div>
	);
}

function BusinessCustomerLayer({
	selectedCpo,
	onSelectCpo,
	highlightedLeader,
	onHighlightLeader,
}: {
	selectedCpo: string | null;
	onSelectCpo: (id: string | null) => void;
	highlightedLeader: 'telecom-core' | 'vitriny' | null;
	onHighlightLeader: (id: 'telecom-core' | 'vitriny' | null) => void;
}) {
	const theme = useHostTheme();

	return (
		<PanelBox title="БИЗНЕС-ЗАКАЗЧИКИ">
			<Stack gap={10}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
						<BusinessLeaderPill
							label={BUSINESS_LEADERS[0].label}
							active={highlightedLeader === 'telecom-core'}
							onHover={(h) => onHighlightLeader(h ? 'telecom-core' : null)}
						/>
						<FlowArrow label="управляет" active={highlightedLeader === 'telecom-core'} />
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
						<BusinessLeaderPill
							label={BUSINESS_LEADERS[1].label}
							active={highlightedLeader === 'vitriny'}
							onHover={(h) => onHighlightLeader(h ? 'vitriny' : null)}
						/>
						<Text size="small" tone="tertiary" style={{ textAlign: 'center' }}>
							→ {DIGITAL_CPO_TITLE} ↓
						</Text>
					</div>
				</div>

				<div
					style={{
						padding: '10px 12px',
						borderRadius: 6,
						border: `1px solid ${highlightedLeader === 'telecom-core' ? theme.category.blue : theme.stroke.secondary}`,
						background: theme.fill.quaternary,
						transition: 'border-color 0.2s',
					}}
				>
					<Text size="small" weight="semibold" style={{ marginBottom: 8 }}>
						CPO продуктовых направлений
					</Text>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
						{CPO_ROLES.map((cpo) => {
							const active = selectedCpo === cpo.id;
							return (
								<button
									key={cpo.id}
									type="button"
									onClick={() => onSelectCpo(active ? null : cpo.id)}
									style={{
										padding: '8px 10px',
										borderRadius: 4,
										fontSize: 10,
										lineHeight: '13px',
										fontWeight: active ? 700 : 500,
										textAlign: 'center',
										cursor: 'pointer',
										border: `1px solid ${active ? theme.category.yellow : theme.stroke.secondary}`,
										background: active ? theme.fill.secondary : theme.category.yellow,
										color: active ? theme.text.primary : theme.text.onAccent,
										minWidth: 0,
										wordBreak: 'break-word',
									}}
								>
									{cpo.label}
								</button>
							);
						})}
					</div>
				</div>

				<Row gap={12} align="start">
					<FlowArrow label="Запросы" active={selectedCpo !== null} />
					<Text size="small" tone="tertiary">
						Запросы от CPO направлений → платформа Telecom
					</Text>
				</Row>
			</Stack>
		</PanelBox>
	);
}

function teamCountLabel(count: number): string {
	if (count === 1) return '1 команда';
	if (count >= 2 && count <= 4) return `${count} команды`;
	return `${count} команд`;
}

function TeamStructure({
	selectedCpo,
	activeDomain,
}: {
	selectedCpo: string | null;
	activeDomain: DomainId | null;
}) {
	const theme = useHostTheme();
	const cpo = selectedCpo ? CPO_ROLES.find((c) => c.id === selectedCpo) : null;
	const highlightTeams = cpo?.teamIds ?? [];
	const showSection = activeDomain === 'telecom' || selectedCpo !== null;

	return (
		<div style={{ opacity: showSection ? 1 : 0.55, transition: 'opacity 0.2s' }}>
			<FlowArrow active={showSection && selectedCpo !== null} />
			<PanelBox
				title="КОМАНДА ТЕЛЕКОМ ПЛАТФОРМЫ"
				titleStyle={{ color: theme.category.green }}
			>
				<Stack gap={10}>
					<div>
						<Text size="small" weight="semibold" style={{ marginBottom: 6 }}>
							Направление и продуктовые команды
						</Text>
						<Row gap={6} align="start">
							{DIRECTIONS.map((dir) => {
								const teams = PRODUCT_TEAMS.filter((t) => t.direction === dir.id);
								const dirHighlighted =
									cpo !== null &&
									teams.some((t) => highlightTeams.includes(t.id));
								return (
									<div key={dir.id} style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												padding: '8px 10px',
												borderRadius: 4,
												textAlign: 'center',
												fontSize: 10,
												fontWeight: dirHighlighted ? 700 : 500,
												border: `1px solid ${dirHighlighted ? theme.category.orange : theme.stroke.secondary}`,
												background: theme.category.orange,
												color: theme.text.onAccent,
												opacity: cpo && !dirHighlighted ? 0.5 : 1,
											}}
										>
											{dir.label}
											<div style={{ fontSize: 9, marginTop: 2, opacity: 0.85 }}>
												{teamCountLabel(teams.length)}
											</div>
										</div>
										<Stack gap={6} style={{ marginTop: 6 }}>
											{teams.map((team) => {
												const highlighted = highlightTeams.includes(team.id);
												const dimmed = cpo !== null && !highlighted;
												return (
													<div
														key={team.id}
														style={{
															padding: '10px 8px',
															borderRadius: 4,
															fontSize: 10,
															lineHeight: '13px',
															textAlign: 'center',
															border: `1px solid ${highlighted ? theme.category.green : theme.stroke.secondary}`,
															background: theme.bg.elevated,
															color: theme.text.secondary,
															opacity: dimmed ? 0.4 : 1,
															fontWeight: highlighted ? 700 : 400,
															transition: 'opacity 0.15s, border-color 0.15s',
															wordBreak: 'break-word',
														}}
													>
														{team.label}
													</div>
												);
											})}
										</Stack>
									</div>
								);
							})}
						</Row>
					</div>
				</Stack>
			</PanelBox>
		</div>
	);
}

function HorizontalBand({
	title,
	color,
	children,
	subtitle,
	dimmed,
}: {
	title: string;
	color: Color;
	children: ReactNode;
	subtitle?: string;
	dimmed?: boolean;
}) {
	const theme = useHostTheme();
	const accent = theme.category[color];
	return (
		<div
			style={{
				border: `1px solid ${theme.stroke.secondary}`,
				borderLeft: `4px solid ${accent}`,
				borderRadius: 6,
				background: theme.fill.quaternary,
				padding: 10,
				opacity: dimmed ? 0.45 : 1,
				transition: 'opacity 0.2s',
			}}
		>
			<Row gap={8} align="center" style={{ marginBottom: 8 }}>
				<Swatch color={color} />
				<div>
					<div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{title}</div>
					{subtitle && <div style={{ fontSize: 9, color: theme.text.tertiary, marginTop: 2 }}>{subtitle}</div>}
				</div>
			</Row>
			{children}
		</div>
	);
}

function RacRoleCell({ role, highlight }: { role: RacRole; highlight: boolean }) {
	const theme = useHostTheme();
	const colors: Partial<Record<RacRole, string>> = {
		R: theme.category.blue,
		A: theme.category.green,
		C: theme.category.orange,
		I: theme.category.gray,
	};
	return (
		<span
			style={{
				fontWeight: highlight ? 700 : 500,
				color: highlight && role !== '—' ? colors[role] : theme.text.secondary,
				fontSize: 12,
			}}
		>
			{role}
		</span>
	);
}

function InteractionNodeCard({
	title,
	subtitle,
	description,
	color,
	items,
	selected,
	dimmed,
	onSelect,
	compact,
}: {
	title: string;
	subtitle?: string;
	description?: string;
	color: Color;
	items?: string[];
	selected: boolean;
	dimmed: boolean;
	onSelect: () => void;
	compact?: boolean;
}) {
	const theme = useHostTheme();
	const accent = theme.category[color];
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				display: 'block',
				width: '100%',
				height: '100%',
				textAlign: 'left',
				padding: compact ? '8px 10px' : '10px 12px',
				borderRadius: 6,
				border: `1px solid ${selected ? accent : theme.stroke.secondary}`,
				borderLeft: `4px solid ${accent}`,
				background: selected ? theme.fill.secondary : theme.bg.elevated,
				cursor: 'pointer',
				opacity: dimmed ? 0.45 : 1,
				transition: 'opacity 0.15s, border-color 0.15s',
			}}
		>
			<div style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color: accent, lineHeight: '14px' }}>{title}</div>
			{subtitle && (
				<div style={{ fontSize: 9, color: theme.text.tertiary, marginTop: 2 }}>{subtitle}</div>
			)}
			{description && (
				<div style={{ fontSize: 10, color: theme.text.secondary, marginTop: 6, lineHeight: '14px' }}>{description}</div>
			)}
			{items && items.length > 0 && (
				<Stack gap={3} style={{ marginTop: 6 }}>
					{items.map((item) => (
						<div key={item}>
							<Text size="small" tone="tertiary">{`· ${item}`}</Text>
						</div>
					))}
				</Stack>
			)}
		</button>
	);
}

function FlowStepArrow({
	color,
	dashed,
	label,
}: {
	color: Color;
	dashed?: boolean;
	label?: string;
}) {
	const theme = useHostTheme();
	const stroke = theme.category[color];
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 4px',
				minWidth: 64,
				alignSelf: 'stretch',
			}}
		>
			<svg width={56} height={32} viewBox="0 0 56 32" aria-hidden>
				<path
					d="M4 16 H44 M44 16 l-10-7 M44 16 l-10 7"
					stroke={stroke}
					strokeWidth={3}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray={dashed ? '6 4' : undefined}
				/>
			</svg>
			{label && (
				<div
					style={{
						fontSize: 8,
						fontWeight: 600,
						color: stroke,
						textAlign: 'center',
						lineHeight: '11px',
						marginTop: 2,
						maxWidth: 72,
					}}
				>
					{label}
				</div>
			)}
		</div>
	);
}

function InteractionFlowModel({
	activeStep,
	onSelectStep,
}: {
	activeStep: InteractionNodeId | null;
	onSelectStep: (id: InteractionNodeId | null) => void;
}) {
	const theme = useHostTheme();

	const stepArrowMeta: Array<{ color: Color; dashed?: boolean; label?: string }> = [
		{ color: 'green', dashed: true, label: 'запросы' },
		{ color: 'green', dashed: true, label: 'roadmap' },
		{ color: 'purple', label: 'портфель' },
		{ color: 'purple', label: 'домены' },
	];

	return (
		<Stack gap={16}>
			<div style={{ overflowX: 'auto', paddingBottom: 4 }}>
				<div style={{ display: 'flex', alignItems: 'stretch', width: '100%', minWidth: 960 }}>
					{INTERACTION_FLOW_STEPS.map((step, idx) => {
						const selected = activeStep === step.id;
						const dimmed = activeStep !== null && !selected;
						return (
							<div key={step.id} style={{ display: 'contents' }}>
								<div style={{ flex: '1 1 0', minWidth: 0, display: 'flex' }}>
									<InteractionNodeCard
										title={step.title}
										subtitle={step.subtitle}
										color={step.color}
										items={step.items}
										selected={selected}
										dimmed={dimmed}
										onSelect={() => onSelectStep(selected ? null : step.id)}
										compact
									/>
								</div>
								{idx < INTERACTION_FLOW_STEPS.length - 1 && (
									<FlowStepArrow
										color={stepArrowMeta[idx].color}
										dashed={stepArrowMeta[idx].dashed}
										label={stepArrowMeta[idx].label}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div style={{ position: 'relative', height: 72, marginTop: 4 }}>
				<svg width="100%" height="72" viewBox="0 0 1040 72" preserveAspectRatio="xMidYMid meet" aria-hidden>
					<path
						d="M820 12 C820 52, 220 52, 220 12"
						stroke={theme.category.purple}
						strokeWidth={3}
						fill="none"
						strokeDasharray="8 5"
						strokeLinecap="round"
					/>
					<path
						d="M220 12 l8 6 M220 12 l-2 10"
						stroke={theme.category.purple}
						strokeWidth={3}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M820 12 l-8 6 M820 12 l2 10"
						stroke={theme.category.purple}
						strokeWidth={3}
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: 46,
						transform: 'translateX(-50%)',
						fontSize: 10,
						fontWeight: 600,
						color: theme.category.purple,
						padding: '4px 10px',
						borderRadius: 4,
						background: theme.fill.quaternary,
						border: `1px dashed ${theme.category.purple}`,
						whiteSpace: 'nowrap',
					}}
				>
					Обратная связь и измерение результата (AБПП, GM)
				</div>
				<div style={{ position: 'absolute', left: '18%', top: 4, fontSize: 9, color: theme.text.tertiary }}>
					← Бизнес лидеры
				</div>
				<div style={{ position: 'absolute', right: '14%', top: 4, fontSize: 9, color: theme.text.tertiary }}>
					Платформенные CPO →
				</div>
			</div>
		</Stack>
	);
}

function CpoRoleZoneCard({
	zone,
	selected,
	onSelect,
}: {
	zone: CpoRoleZone;
	selected: boolean;
	onSelect: () => void;
}) {
	const theme = useHostTheme();
	const accent = theme.category[zone.color];
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				display: 'block',
				width: '100%',
				textAlign: 'left',
				padding: 12,
				borderRadius: 6,
				border: `1px solid ${selected ? accent : theme.stroke.secondary}`,
				borderLeft: `4px solid ${accent}`,
				background: selected ? theme.fill.secondary : theme.bg.elevated,
				cursor: 'pointer',
				transition: 'border-color 0.15s, background 0.15s',
			}}
		>
			<Row gap={8} align="center" style={{ marginBottom: 6 }}>
				<Swatch color={zone.color} />
				<div>
					<div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{zone.title}</div>
					<div style={{ fontSize: 9, color: theme.text.tertiary }}>{zone.subtitle}</div>
				</div>
			</Row>
			<Text size="small" tone="secondary" style={{ marginBottom: 8 }}>
				{zone.ownership}
			</Text>
			<Text size="small" weight="semibold" style={{ marginBottom: 4 }}>
				Отвечает за:
			</Text>
			<Stack gap={3}>
				{zone.responsibilities.map((item) => (
					<div key={item}>
						<Text size="small" tone="tertiary">{`· ${item}`}</Text>
					</div>
				))}
			</Stack>
			<div
				style={{
					marginTop: 8,
					padding: '6px 8px',
					borderRadius: 4,
					background: theme.fill.quaternary,
					border: `1px solid ${theme.stroke.tertiary}`,
				}}
			>
				<Text size="small" weight="semibold">
					KPI:{' '}
				</Text>
				<Text size="small" tone="secondary">
					{zone.kpis}
				</Text>
			</div>
		</button>
	);
}

function CpoRoleZoneSummary({ zone }: { zone: CpoRoleZone }) {
	const theme = useHostTheme();
	const accent = theme.category[zone.color];
	return (
		<PanelBox title={`ЗОНА · ${zone.title.toUpperCase()}`} titleStyle={{ color: accent }}>
			<Stack gap={6}>
				<Text size="small" tone="secondary">
					{zone.ownership}
				</Text>
				<Stack gap={3}>
					{zone.responsibilities.slice(0, 4).map((item) => (
						<div key={item}>
							<Text size="small" tone="tertiary">{`· ${item}`}</Text>
						</div>
					))}
				</Stack>
				<Text size="small" tone="tertiary">
					KPI: {zone.kpis}
				</Text>
			</Stack>
		</PanelBox>
	);
}

function CpoRoleZonesSection({
	selectedZoneId,
	onSelectZone,
}: {
	selectedZoneId: CpoRoleZoneId | null;
	onSelectZone: (id: CpoRoleZoneId | null) => void;
}) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
			{CPO_ROLE_ZONES.map((zone) => (
				<div key={zone.id} style={{ minWidth: 0 }}>
					<CpoRoleZoneCard
						zone={zone}
						selected={selectedZoneId === zone.id}
						onSelect={() => onSelectZone(selectedZoneId === zone.id ? null : zone.id)}
					/>
				</div>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function MegafonCpoArchitecture() {
	const theme = useHostTheme();
	const [selectedId, setSelectedId] = useCanvasState<string | null>('selectedTile', null);
	const [selectedCpo, setSelectedCpo] = useCanvasState<string | null>('selectedCpo', null);
	const [activeDomain, setActiveDomain] = useCanvasState<DomainId | null>('activeDomain', null);
	const [raciFilter, setRaciFilter] = useCanvasState('raciFilter', 'all');
	const [focusMode, setFocusMode] = useCanvasState('focusMode', true);
	const [highlightedLeader, setHighlightedLeader] = useCanvasState<'telecom-core' | 'vitriny' | null>(
		'highlightedLeader',
		null,
	);
	const [interactionStep, setInteractionStep] = useCanvasState<InteractionNodeId | null>('interactionStep', null);
	const [selectedRoleZone, setSelectedRoleZone] = useCanvasState<CpoRoleZoneId | null>('selectedRoleZone', null);

	const vitrinyActive = highlightedLeader === 'vitriny';

	const filteredRaci = useMemo(() => {
		if (raciFilter === 'all') return RACI_ROWS;
		const role = raciFilter as 'R' | 'A' | 'C' | 'I';
		return RACI_ROWS.filter(
			(r) => r.telecom === role || r.cx === role || r.vas === role || r.platform === role || r.product === role,
		);
	}, [raciFilter]);

	const integrationDimmed = focusMode && activeDomain !== null;

	const sidebarRoleZone = useMemo(() => {
		if (selectedRoleZone) return zoneById(selectedRoleZone);
		if (activeDomain) return zoneById(DOMAIN_TO_ZONE[activeDomain]);
		return zoneById('digital');
	}, [selectedRoleZone, activeDomain]);

	return (
		<div style={{ fontFamily: 'inherit', color: theme.text.primary, padding: 12, minWidth: 1100 }}>
			<Row gap={8} align="center" style={{ marginBottom: 10 }}>
				<Text size="small">Режим фокуса (подсветка колонок)</Text>
				<Toggle checked={focusMode} onChange={setFocusMode} />
				{selectedCpo && (
					<Button variant="ghost" onClick={() => setSelectedCpo(null)}>
						Сбросить CPO
					</Button>
				)}
			</Row>

			<BusinessCustomerLayer
				selectedCpo={selectedCpo}
				onSelectCpo={setSelectedCpo}
				highlightedLeader={highlightedLeader}
				onHighlightLeader={setHighlightedLeader}
			/>

			<VitrinyToDigitalCpoArrow active={vitrinyActive} />
			<DigitalProductCpoHeader highlighted={vitrinyActive} />

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '200px 1fr 220px',
					gap: 10,
					alignItems: 'start',
					marginTop: 10,
				}}
			>
				<Stack gap={8} style={{ minWidth: 0 }}>
					<PanelBox title="ЗАЧЕМ ПЛАТФОРМА">
						<Text size="small" tone="secondary">
							Платформа даёт общие capabilities — каталоги, поиск, навигацию, профиль и сервисы — всем
							доменам. Новые продукты запускаются быстрее и выглядят единообразно.
						</Text>
					</PanelBox>
					<PanelBox title="СВЯЗЬ С БИЗНЕСОМ">
						<Stack gap={8}>
							{BUSINESS_CONNECTION_METRICS.map((metric) => (
								<div key={metric.label}>
									<Text size="small" weight="semibold">
										{metric.label}
									</Text>
									<Text size="small" tone="tertiary" style={{ marginTop: 2 }}>
										{metric.description}
									</Text>
								</div>
							))}
						</Stack>
					</PanelBox>
				</Stack>

				<Stack gap={10}>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
							gap: 8,
							alignItems: 'stretch',
						}}
					>
						{DOMAINS.map((d) => (
							<div key={d.id} style={{ minWidth: 0, display: 'flex' }}>
								<DomainColumn
									domain={d}
									selectedId={selectedId}
									activeDomain={focusMode ? activeDomain : null}
									selectedCpo={selectedCpo}
									onSelect={setSelectedId}
									onHoverTile={() => {}}
									onActivate={setActiveDomain}
								/>
							</div>
						))}
					</div>

					<HorizontalBand title="ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ" color="purple" dimmed={integrationDimmed}>
						<TileGrid
							tiles={INTEGRATION_TILES}
							accent={theme.category.purple}
							columns={7}
							selectedId={selectedId}
							dimmed={integrationDimmed}
							onSelect={setSelectedId}
							onHover={() => {}}
						/>
					</HorizontalBand>

					<TeamStructure selectedCpo={selectedCpo} activeDomain={focusMode ? activeDomain : null} />
				</Stack>

				<Stack gap={8} style={{ minWidth: 0 }}>
					<CpoRoleZoneSummary zone={sidebarRoleZone} />
					<Text size="small" tone="quaternary">
						Наведите на колонку платформы или откройте блок «2. Описание ролей» ниже.
					</Text>
				</Stack>
			</div>

			<div style={{ marginTop: 14 }}>
				<CollapsibleSection
					title="1. Модель взаимодействия"
					defaultOpen
					leading={<Swatch color="purple" />}
				>
					<Stack gap={8} style={{ paddingTop: 4 }}>
						{interactionStep && (
							<Button variant="ghost" onClick={() => setInteractionStep(null)}>
								Сбросить выбор
							</Button>
						)}
						<InteractionFlowModel activeStep={interactionStep} onSelectStep={setInteractionStep} />
					</Stack>
				</CollapsibleSection>
			</div>

			<div style={{ marginTop: 10 }}>
				<CollapsibleSection
					title="2. Описание ролей и зон ответственности"
					count={4}
					defaultOpen
					leading={<Swatch color="purple" />}
				>
					<Stack gap={8} style={{ paddingTop: 4 }}>
						{selectedRoleZone && (
							<Button variant="ghost" onClick={() => setSelectedRoleZone(null)}>
								Сбросить выбор
							</Button>
						)}
						<CpoRoleZonesSection selectedZoneId={selectedRoleZone} onSelectZone={setSelectedRoleZone} />
					</Stack>
				</CollapsibleSection>
			</div>

			<div style={{ marginTop: 14 }}>
				<CollapsibleSection title="Легенда RACI" count={RACI_ROWS.length}>
					<Stack gap={10} style={{ paddingTop: 4 }}>
						<Row gap={16} wrap>
							{[
								['R', 'Responsible — исполняет'],
								['A', 'Accountable — отвечает'],
								['C', 'Consulted — консультирует'],
								['I', 'Informed — информируется'],
							].map(([role, label]) => (
								<div key={role}>
									<Row gap={6} align="center">
										<span
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: 22,
												height: 22,
												borderRadius: 4,
												background: theme.fill.tertiary,
												fontSize: 11,
												fontWeight: 700,
											}}
										>
											{role}
										</span>
										<Text size="small" tone="tertiary">
											{label}
										</Text>
									</Row>
								</div>
							))}
							<div style={{ marginLeft: 'auto' }}>
								<Select
									value={raciFilter}
									onChange={setRaciFilter}
									options={[
										{ value: 'all', label: 'Все роли' },
										{ value: 'R', label: 'R — Responsible' },
										{ value: 'A', label: 'A — Accountable' },
										{ value: 'C', label: 'C — Consulted' },
										{ value: 'I', label: 'I — Informed' },
									]}
								/>
							</div>
						</Row>

						<Table
							headers={['Зона', 'Head Telecom', 'Head CX', 'Head VAS', 'Platform', 'Product (P&L)']}
							rows={filteredRaci.map((row) => [
								row.area,
								<RacRoleCell role={row.telecom} highlight={raciFilter === row.telecom || raciFilter === 'R'} />,
								<RacRoleCell role={row.cx} highlight={raciFilter === row.cx || raciFilter === 'A'} />,
								<RacRoleCell role={row.vas} highlight={raciFilter === row.vas} />,
								<RacRoleCell role={row.platform} highlight={raciFilter === row.platform} />,
								<RacRoleCell role={row.product} highlight={raciFilter === row.product} />,
							])}
							striped
							stickyHeader
						/>
					</Stack>
				</CollapsibleSection>
			</div>
		</div>
	);
}
