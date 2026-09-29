export const DEFAULT_SERVICE_RADIUS_KM = 3;
export const BOOSTED_SERVICE_RADIUS_KM = 5;

export const SKILL_CATALOG = [
  {
    code: 'home_cleaning',
    name: 'Home Cleaning',
    category: 'Home',
    trainingTrack: 'Cleaning',
    description: 'Sweeping, mopping, dusting and bathroom wipe-down',
    matchKeywords: 'home cleaning,cleaning,maid,mop,dust,bathroom',
  },
  {
    code: 'dishwashing',
    name: 'Dishwashing',
    category: 'Home',
    trainingTrack: 'Cleaning',
    description: 'Kitchen utensils and sink area',
    matchKeywords: 'dish,utensil,kitchen sink',
  },
  {
    code: 'laundry',
    name: 'Laundry',
    category: 'Home',
    trainingTrack: 'Cleaning',
    description: 'Washing, drying and folding clothes',
    matchKeywords: 'laundry,wash,clothes,fold',
  },
  {
    code: 'ironing',
    name: 'Ironing',
    category: 'Home',
    trainingTrack: 'Cleaning',
    description: 'Pressing clothes and linens',
    matchKeywords: 'iron,press,linen',
  },
  {
    code: 'kitchen_assistance',
    name: 'Kitchen Assistance',
    category: 'Home',
    trainingTrack: 'Cleaning',
    description: 'Light cooking help and kitchen prep',
    matchKeywords: 'kitchen,cook,prep,assistance',
  },
  {
    code: 'basic_beauty',
    name: 'Basic Beauty',
    category: 'Beauty',
    trainingTrack: 'Beauty',
    description: 'Threading, cleanup and basic grooming',
    matchKeywords: 'beauty,thread,groom,cleanup,facial',
  },
  {
    code: 'manicure_pedicure',
    name: 'Manicure / Pedicure',
    category: 'Beauty',
    trainingTrack: 'Beauty',
    description: 'Hands and feet grooming',
    matchKeywords: 'manicure,pedicure,nail',
  },
  {
    code: 'head_massage',
    name: 'Head Massage',
    category: 'Wellness',
    trainingTrack: 'Massage',
    description: 'Head, neck and shoulder massage',
    matchKeywords: 'massage,head,neck,shoulder,wellness',
  },
] as const;
