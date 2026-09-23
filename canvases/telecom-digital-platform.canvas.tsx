import type { ReactNode } from 'react';
import { Row, Stack, Text, useCanvasState, useHostTheme } from 'cursor/canvas';

type DomainId = 'acq' | 'tariff' | 'self' | 'postsale';

const VALUE = {
	title: 'Ценность продукта',
	client: [
		'Простое решение телеком-задач',
		'Удобный и понятный интерфейс',
		'Быстрый путь от потребности до подключения',
	],
	business: [
		'Эффективные продажи',
		'Быстрый вывод продуктов в digital',
		'Гибкая платформа для масштабирования',
	],
};

const LEFT = {
	title: 'Telecom Business',
	subtitle: 'CPO / Продуктовый бизнес',
	provides: [
		'Телеком-продукты (тарифы, опции, услуги, семейные продукты и т.д.)',
		'Цены и условия',
		'Бизнес-цели и экономика',
	],
	results: [
		'Продажи и подключенные клиенты',
		'Рост ARPU',
		'Доля digital-каналов',
		'Эффективность продуктовой модели',
	],
	arrow: 'Офферы и бизнес-условия (продуктовый контент)',
};

const RIGHT = {
	title: 'Конечный клиент',
	subtitle: 'пользователь',
	uses: [
		'Поиска и выбора телеком-продуктов',
		'Управления услугами',
		'Решения вопросов и поддержки',
	],
	results: [
		'Удобство и скорость',
		'Прозрачность условий',
		'Доступ к нужному продукту',
		'Позитивный опыт (CX)',
	],
	arrow: 'Цифровой опыт клиента (продуктовый результат)',
};

const DOMAINS: Array<{
	id: DomainId;
	title: string;
	subtitle: string;
	detail: string;
	bg: string;
	border: string;
}> = [
	{
		id: 'acq',
		title: 'Acquisition',
		subtitle: 'Новые абоненты',
		detail: 'MNP, SIM, eSIM, стартовые пакеты',
		bg: '#eff6ff',
		border: '#bfdbfe',
	},
	{
		id: 'tariff',
		title: 'Tariff & Offers',
		subtitle: 'Выбор и сравнение',
		detail: 'Тарифы, опции, семейные продукты, специальные предложения',
		bg: '#f5f3ff',
		border: '#ddd6fe',
	},
	{
		id: 'self',
		title: 'Self-service',
		subtitle: 'Управление услугами',
		detail: 'Баланс, тариф, услуги, доп. опции, настройки',
		bg: '#ecfdf5',
		border: '#a7f3d0',
	},
	{
		id: 'postsale',
		title: 'Post-sale',
		subtitle: 'Активация и удержание',
		detail: 'Подключение, активация, поддержка, лояльность',
		bg: '#fff7ed',
		border: '#fed7aa',
	},
];

const JOURNEYS = [
	'Поиск и интерес',
	'Изучение и выбор',
	'Оформление и оплата',
	'Подключение и активация',
	'Использование и управление',
];

const CAPS = [
	'Каталог и витрина',
	'Навигация и поиск',
	'Карточки',
	'Механики персонализации',
	'Корзина / checkout',
	'Интеграции с бэкендом',
	'Проверка личности (KYC)',
	'Оплата',
	'Аналитика и метрики',
	'A/B тестирование и оптимизация',
];

const CHANNELS = ['Сайт', 'Мобильное приложение', 'Личный кабинет', 'Чат-бот / поддержка', 'Другие каналы'];

const METRICS = [
	{
		title: 'Для продаж',
		items: ['Digital sales', 'Conversion по воронке', 'Новые абоненты / MNP', 'Cross-sell / Upsell'],
	},
	{
		title: 'Для самообслуживания',
		items: [
			'Доля решенных задач без оператора',
			'Digital adoption',
			'Успешность сценариев',
			'Снижение обращений в поддержку',
		],
	},
	{
		title: 'Для бизнеса',
		items: [
			'Time-to-market нового оффера',
			'Стоимость вывода в digital',
			'Reuse capabilities',
			'Доля продуктов в digital',
		],
	},
	{
		title: 'Итог',
		items: ['Довольный клиент + эффективный бизнес = рост и развитие телекома'],
	},
];

const RELATED: Record<DomainId, number[]> = {
	acq: [0, 1],
	tariff: [1, 2],
	self: [4],
	postsale: [3, 4],
};

function card(style: Record<string, string | number>, children: ReactNode) {
	return <div style={{ borderRadius: 14, padding: 12, ...style }}>{children}</div>;
}

function BulletList({ items, check }: { items: string[]; check?: boolean }) {
	return (
		<Stack gap={4}>
			{items.map((item) => (
				<Text key={item} size="small" tone="secondary">
					{check ? `✓ ${item}` : `• ${item}`}
				</Text>
			))}
		</Stack>
	);
}

export default function TelecomDigitalPlatform() {
	const theme = useHostTheme();
	const [selected, setSelected] = useCanvasState<DomainId | null>('platformDomain', null);

	return (
		<div style={{ fontFamily: 'inherit', color: theme.text.primary, padding: 12, minWidth: 1100 }}>
			<Row gap={24} align="start" style={{ marginBottom: 16 }}>
				<Stack gap={8} style={{ flex: 1.4 }}>
					<Text size="large" weight="bold">
						Telecom Digital Platform
					</Text>
					<Text size="small" tone="secondary">
						Цифровая платформа взаимодействия клиента с телекомом
					</Text>
					<Text size="small">
						Наша миссия — обеспечивать удобный, быстрый и эффективный цифровой путь клиента от
						потребности до покупки, подключения и дальнейшего управления телеком-продуктами.
					</Text>
				</Stack>
				<Stack gap={8} style={{ flex: 1 }}>
					<Text weight="semibold">{VALUE.title}</Text>
					<Row gap={16} align="start">
						<Stack gap={6} style={{ flex: 1 }}>
							<Text size="small" weight="semibold">
								Для клиента
							</Text>
							<BulletList items={VALUE.client} />
						</Stack>
						<Stack gap={6} style={{ flex: 1 }}>
							<Text size="small" weight="semibold">
								Для бизнеса
							</Text>
							<BulletList items={VALUE.business} />
						</Stack>
					</Row>
				</Stack>
			</Row>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '220px 1fr 220px',
					gap: 12,
					alignItems: 'stretch',
				}}
			>
				{card(
					{ background: '#f5f3ff', border: '1px solid #ddd6fe' },
					<Stack gap={10}>
						<Stack gap={2}>
							<Text weight="semibold">{LEFT.title}</Text>
							<Text size="small" tone="tertiary">
								{LEFT.subtitle}
							</Text>
						</Stack>
						<Stack gap={4}>
							<Text size="small" weight="semibold">
								Что предоставляет:
							</Text>
							<BulletList items={LEFT.provides} />
						</Stack>
						<Stack gap={4}>
							<Text size="small" weight="semibold">
								Результат для бизнеса:
							</Text>
							<BulletList items={LEFT.results} check />
						</Stack>
						<Text size="small" tone="tertiary">
							→ {LEFT.arrow}
						</Text>
					</Stack>,
				)}

				<div style={{ border: '1px solid #dbe3ef', borderRadius: 16, overflow: 'hidden' }}>
					<div style={{ background: '#16324f', color: '#fff', padding: '12px 14px' }}>
						<Text weight="semibold">Telecom Digital Platform</Text>
						<Text size="small">Продуктовые домены и клиентские сценарии</Text>
					</div>
					<Stack gap={10} style={{ padding: 12 }}>
						<Stack gap={8}>
							<Text size="small" weight="semibold">
								1. Продуктовые домены (Business / Product Domains)
							</Text>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
								{DOMAINS.map((d) => (
									<button
										key={d.id}
										type="button"
										onClick={() => setSelected(selected === d.id ? null : d.id)}
										style={{
											background: d.bg,
											border: `1px solid ${selected === d.id ? '#111827' : d.border}`,
											borderRadius: 10,
											padding: 10,
											textAlign: 'left',
											opacity: selected && selected !== d.id ? 0.45 : 1,
											cursor: 'pointer',
										}}
									>
										<Text size="small" weight="semibold">
											{d.title}
										</Text>
										<Text size="small">{d.subtitle}</Text>
										<Text size="small" tone="secondary">
											{d.detail}
										</Text>
									</button>
								))}
							</div>
						</Stack>

						<Stack gap={8}>
							<Text size="small" weight="semibold">
								2. Клиентские сценарии (Customer Journeys)
							</Text>
							<Row gap={6} style={{ flexWrap: 'wrap' }}>
								{JOURNEYS.map((label, i) => {
									const active = selected ? RELATED[selected].includes(i) : true;
									return (
										<div
											key={label}
											style={{
												border: '1px solid #e5e7eb',
												borderRadius: 999,
												padding: '4px 10px',
												opacity: active ? 1 : 0.4,
											}}
										>
											<Text size="small">{label}</Text>
										</div>
									);
								})}
							</Row>
						</Stack>

						<Stack gap={8}>
							<Text size="small" weight="semibold">
								3. Платформенные возможности (Reusable Capabilities)
							</Text>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8 }}>
								{CAPS.map((label) => (
									<Text key={label} size="small">
										{label}
									</Text>
								))}
							</div>
						</Stack>

						<Stack gap={8}>
							<Text size="small" weight="semibold">
								4. Каналы (Channels / Surfaces)
							</Text>
							<Row gap={10} style={{ flexWrap: 'wrap' }}>
								{CHANNELS.map((label) => (
									<Text key={label} size="small">
										{label}
									</Text>
								))}
							</Row>
						</Stack>
					</Stack>
				</div>

				{card(
					{ background: '#ecfdf5', border: '1px solid #a7f3d0' },
					<Stack gap={10}>
						<Stack gap={2}>
							<Text weight="semibold">{RIGHT.title}</Text>
							<Text size="small" tone="tertiary">
								{RIGHT.subtitle}
							</Text>
						</Stack>
						<Stack gap={4}>
							<Text size="small" weight="semibold">
								Использует продукт для:
							</Text>
							<BulletList items={RIGHT.uses} />
						</Stack>
						<Stack gap={4}>
							<Text size="small" weight="semibold">
								Результат для клиента:
							</Text>
							<BulletList items={RIGHT.results} check />
						</Stack>
						<Text size="small" tone="tertiary">
							→ {RIGHT.arrow}
						</Text>
					</Stack>,
				)}
			</div>

			<div style={{ marginTop: 14, border: '1px solid #e4e7ee', borderRadius: 14, padding: 12 }}>
				<Text weight="semibold">Ключевые метрики и результат</Text>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 10 }}>
					{METRICS.map((col) => (
						<Stack key={col.title} gap={6}>
							<Text size="small" weight="semibold">
								{col.title}
							</Text>
							<BulletList items={col.items} />
						</Stack>
					))}
				</div>
			</div>
		</div>
	);
}
