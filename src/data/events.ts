import type { GameEvent, EventType, EventOption } from '@/types'

interface EventTemplate {
  titles: string[]
  descriptions: string[]
  options: EventOption[]
}

export const EVENT_TEMPLATES: Record<EventType, EventTemplate> = {
  demand_surge: {
    titles: [
      '{targetName} 需求激增！',
      '{targetName} 出现抢购潮！',
      '{targetName} 冷饮告急！'
    ],
    descriptions: [
      '{targetName} 客流量突然暴增，需求量大幅上升，需要立即补货。',
      '炎热天气导致 {targetName} 冷饮供不应求，紧急需要更多库存。',
      '{targetName} 举办活动吸引大量人群，冷饮需求远超预期。'
    ],
    options: [
      { label: '紧急调配库存（+50% 需求）', effect: 'increase_demand' },
      { label: '维持原定计划（可能缺货）', effect: 'ignore' }
    ]
  },
  route_block: {
    titles: [
      '通往 {targetName} 的道路受阻！',
      '{targetName} 附近交通中断！',
      '{targetName} 路段临时封闭！'
    ],
    descriptions: [
      '通往 {targetName} 的主要道路发生交通事故，暂时无法通行。',
      '{targetName} 附近正在进行道路施工，需要绕行其他路线。',
      '暴雨导致通往 {targetName} 的路段积水，暂时无法通行。'
    ],
    options: [
      { label: '选择绕行路线（增加距离）', effect: 'detour' },
      { label: '等待道路恢复（延误一回合）', effect: 'wait' }
    ]
  },
  anomaly: {
    titles: [
      '{targetName} 设备异常！',
      '{targetName} 冷藏柜故障！',
      '{targetName} 出现异常情况！'
    ],
    descriptions: [
      '{targetName} 的冷藏设备出现故障，部分冷饮可能变质。',
      '{targetName} 报告冷藏柜温度异常，需要紧急处理。',
      '{targetName} 的存储设备出现问题，库存可能受损。'
    ],
    options: [
      { label: '立即派遣维修（消耗额外资源）', effect: 'repair' },
      { label: '暂停该点补货（损失需求）', effect: 'suspend' }
    ]
  },
  boost_refill: {
    titles: [
      '{targetName} 补货效率提升！',
      '{targetName} 获得额外支持！',
      '{targetName} 迎来好消息！'
    ],
    descriptions: [
      '{targetName} 增加了临时工作人员，补货效率大幅提升。',
      '{targetName} 获得志愿者协助，可以更快完成补货。',
      '{targetName} 附近增设了临时补给站，补货更加便捷。'
    ],
    options: [
      { label: '利用机会加速补货（节省时间）', effect: 'accelerate' },
      { label: '按原计划执行（稳定优先）', effect: 'normal' }
    ]
  }
}

export function generateEvent(type: EventType, targetId: string, targetName: string): GameEvent {
  const template = EVENT_TEMPLATES[type]
  const titleIndex = Math.floor(Math.random() * template.titles.length)
  const descIndex = Math.floor(Math.random() * template.descriptions.length)

  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: template.titles[titleIndex].replace('{targetName}', targetName),
    description: template.descriptions[descIndex].replace('{targetName}', targetName),
    targetId,
    options: template.options
  }
}

export function getRandomEventType(): EventType {
  const types: EventType[] = ['demand_surge', 'route_block', 'anomaly', 'boost_refill']
  const weights = [0.35, 0.25, 0.25, 0.15]
  const random = Math.random()
  let cumulative = 0

  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i]
    if (random < cumulative) {
      return types[i]
    }
  }

  return types[0]
}
