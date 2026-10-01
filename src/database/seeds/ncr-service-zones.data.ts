export interface NcrZoneAreaSeed {
  area: string;
  pincode: string;
  buildings_cover: string[];
}

export interface NcrServiceZoneSeed {
  city: string;
  region: string;
  zone: {
    id: string;
    name: string;
    areas: NcrZoneAreaSeed[];
    zone_center: { latitude: number; longitude: number };
    service_radius_km: number;
  };
}

export const STATE_BY_CITY: Record<string, string> = {
  Noida: 'Uttar Pradesh',
  'Greater Noida West': 'Uttar Pradesh',
  'Greater Noida': 'Uttar Pradesh',
  Ghaziabad: 'Uttar Pradesh',
  Delhi: 'Delhi',
  Gurugram: 'Haryana',
  Faridabad: 'Haryana',
  Sonipat: 'Haryana',
  Bahadurgarh: 'Haryana',
};

export const NCR_SERVICE_ZONES: NcrServiceZoneSeed[] = [
  {
    city: 'Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'NOI_N1',
      name: 'Noida North Central',
      areas: [
        {
          area: 'Sector 12-16',
          pincode: '201301',
          buildings_cover: [
            'Sector 12 residential',
            'Sector 15 residential',
            'Sector 16 residential',
            'Nearby apartment clusters',
          ],
        },
        {
          area: 'Sector 19-20',
          pincode: '201301',
          buildings_cover: ['Sector 19 residential', 'Sector 20 residential', 'Nearby societies'],
        },
        {
          area: 'Sector 22-31',
          pincode: '201301',
          buildings_cover: ['Sector 22', 'Sector 27', 'Sector 28', 'Sector 29', 'Sector 30', 'Sector 31'],
        },
      ],
      zone_center: { latitude: 28.59, longitude: 77.32 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'NOI_N2',
      name: 'Noida Central',
      areas: [
        {
          area: 'Sector 50-53',
          pincode: '201301',
          buildings_cover: [
            'Sector 50 societies',
            'Sector 51 societies',
            'Sector 52 societies',
            'Sector 53 residential',
          ],
        },
        {
          area: 'Sector 61-63',
          pincode: '201301',
          buildings_cover: ['Sector 61 residential', 'Sector 62 residential', 'Sector 63 residential'],
        },
        {
          area: 'Sector 70-73',
          pincode: '201301',
          buildings_cover: ['Sector 70', 'Sector 71', 'Sector 72', 'Sector 73'],
        },
      ],
      zone_center: { latitude: 28.594, longitude: 77.365 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'NOI_N3',
      name: 'Noida High Rise Belt',
      areas: [
        {
          area: 'Sector 74',
          pincode: '201301',
          buildings_cover: ['High-rise societies', 'Sector 74 residential clusters'],
        },
        {
          area: 'Sector 75-79',
          pincode: '201301',
          buildings_cover: [
            'Sector 75 societies',
            'Sector 76 societies',
            'Sector 77 societies',
            'Sector 78 societies',
            'Sector 79 societies',
          ],
        },
        {
          area: 'Sector 82',
          pincode: '201305',
          buildings_cover: ['Sector 82 residential'],
        },
      ],
      zone_center: { latitude: 28.576, longitude: 77.39 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'NOI_N4',
      name: 'Noida South Central',
      areas: [
        {
          area: 'Sector 93-94',
          pincode: '201304',
          buildings_cover: ['Sector 93 societies', 'Sector 94 residential/commercial mixed area'],
        },
        {
          area: 'Sector 100-107',
          pincode: '201304',
          buildings_cover: [
            'Sector 100 societies',
            'Sector 101 societies',
            'Sector 104 societies',
            'Sector 105 societies',
            'Sector 107 societies',
          ],
        },
      ],
      zone_center: { latitude: 28.553, longitude: 77.365 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'NOI_N5',
      name: 'Noida Expressway',
      areas: [
        {
          area: 'Sector 137-143',
          pincode: '201305',
          buildings_cover: ['Sector 137 societies', 'Sector 142 residential', 'Sector 143 residential'],
        },
        {
          area: 'Sector 144-152',
          pincode: '201305',
          buildings_cover: ['Sector 144', 'Sector 150', 'Sector 151', 'Sector 152'],
        },
      ],
      zone_center: { latitude: 28.501, longitude: 77.41 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Greater Noida West',
    region: 'NCR_EAST',
    zone: {
      id: 'GNW_GW1',
      name: 'Greater Noida West Core',
      areas: [
        {
          area: 'Sector 1-4',
          pincode: '201306',
          buildings_cover: ['Sector 1 societies', 'Sector 2 societies', 'Sector 3 societies', 'Sector 4 societies'],
        },
        {
          area: 'Sector 16B',
          pincode: '201306',
          buildings_cover: ['Sector 16B high-rise societies'],
        },
      ],
      zone_center: { latitude: 28.598, longitude: 77.435 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Greater Noida West',
    region: 'NCR_EAST',
    zone: {
      id: 'GNW_GW2',
      name: 'Greater Noida West Extension',
      areas: [
        {
          area: 'Sector 10-12',
          pincode: '201306',
          buildings_cover: ['Sector 10 residential', 'Sector 12 residential'],
        },
        {
          area: 'Sector 16-16C',
          pincode: '201306',
          buildings_cover: ['Sector 16', 'Sector 16B', 'Sector 16C societies'],
        },
        {
          area: 'Techzone',
          pincode: '201306',
          buildings_cover: ['Techzone residential projects', 'Nearby apartment clusters'],
        },
      ],
      zone_center: { latitude: 28.61, longitude: 77.43 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Greater Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'GNO_GN1',
      name: 'Greater Noida Alpha Beta Gamma Delta',
      areas: [
        { area: 'Alpha', pincode: '201310', buildings_cover: ['Alpha residential'] },
        { area: 'Beta', pincode: '201310', buildings_cover: ['Beta residential'] },
        { area: 'Gamma', pincode: '201310', buildings_cover: ['Gamma residential'] },
        { area: 'Delta', pincode: '201310', buildings_cover: ['Delta residential'] },
      ],
      zone_center: { latitude: 28.472, longitude: 77.51 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Greater Noida',
    region: 'NCR_EAST',
    zone: {
      id: 'GNO_GN2',
      name: 'Greater Noida Zeta Iota',
      areas: [
        { area: 'Zeta', pincode: '201310', buildings_cover: ['Zeta residential societies'] },
        { area: 'Eta', pincode: '201310', buildings_cover: ['Eta residential'] },
        { area: 'Iota', pincode: '201310', buildings_cover: ['Iota residential'] },
      ],
      zone_center: { latitude: 28.458, longitude: 77.525 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Ghaziabad',
    region: 'NCR_EAST',
    zone: {
      id: 'GZ_G1',
      name: 'Indirapuram',
      areas: [
        {
          area: 'Ahinsa Khand',
          pincode: '201014',
          buildings_cover: ['Ahinsa Khand 1', 'Ahinsa Khand 2', 'High-rise societies'],
        },
        { area: 'Vaibhav Khand', pincode: '201014', buildings_cover: ['Vaibhav Khand societies'] },
        { area: 'Nyay Khand', pincode: '201014', buildings_cover: ['Nyay Khand societies'] },
      ],
      zone_center: { latitude: 28.641, longitude: 77.371 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Ghaziabad',
    region: 'NCR_EAST',
    zone: {
      id: 'GZ_G2',
      name: 'Vaishali Vasundhara',
      areas: [
        {
          area: 'Vaishali',
          pincode: '201010',
          buildings_cover: ['Vaishali Sector 1-6', 'Residential societies'],
        },
        {
          area: 'Vasundhara',
          pincode: '201012',
          buildings_cover: ['Vasundhara sectors', 'High-rise societies'],
        },
        { area: 'Kaushambi', pincode: '201010', buildings_cover: ['Kaushambi residential'] },
      ],
      zone_center: { latitude: 28.65, longitude: 77.345 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Ghaziabad',
    region: 'NCR_EAST',
    zone: {
      id: 'GZ_G3',
      name: 'Crossings Republik',
      areas: [
        {
          area: 'Crossings Republik',
          pincode: '201016',
          buildings_cover: [
            'Mahagun Mywoods',
            'Gaur City vicinity',
            'Panchsheel',
            'Assotech',
            'Other Crossings Republik societies',
          ],
        },
        { area: 'Dundahera', pincode: '201016', buildings_cover: ['Dundahera residential clusters'] },
      ],
      zone_center: { latitude: 28.6292, longitude: 77.4336 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Ghaziabad',
    region: 'NCR_EAST',
    zone: {
      id: 'GZ_G4',
      name: 'Raj Nagar Extension',
      areas: [
        {
          area: 'Raj Nagar Extension',
          pincode: '201017',
          buildings_cover: ['High-rise societies', 'Residential apartment clusters'],
        },
      ],
      zone_center: { latitude: 28.702, longitude: 77.425 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Ghaziabad',
    region: 'NCR_EAST',
    zone: {
      id: 'GZ_G5',
      name: 'Siddharth Vihar',
      areas: [
        {
          area: 'Siddharth Vihar',
          pincode: '201009',
          buildings_cover: ['High-rise residential societies', 'Pratap Vihar vicinity'],
        },
        { area: 'Pratap Vihar', pincode: '201009', buildings_cover: ['Pratap Vihar residential'] },
      ],
      zone_center: { latitude: 28.666, longitude: 77.42 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Delhi',
    region: 'NCR_CENTRAL',
    zone: {
      id: 'DEL_D1',
      name: 'South Delhi Premium',
      areas: [
        {
          area: 'Vasant Kunj',
          pincode: '110070',
          buildings_cover: ['Vasant Kunj sectors', 'Apartment societies'],
        },
        { area: 'Saket', pincode: '110017', buildings_cover: ['Saket residential'] },
        { area: 'Malviya Nagar', pincode: '110017', buildings_cover: ['Malviya Nagar residential'] },
        { area: 'Greater Kailash', pincode: '110048', buildings_cover: ['GK-I', 'GK-II'] },
        { area: 'CR Park', pincode: '110019', buildings_cover: ['CR Park residential'] },
      ],
      zone_center: { latitude: 28.53, longitude: 77.21 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Delhi',
    region: 'NCR_CENTRAL',
    zone: {
      id: 'DEL_D2',
      name: 'South East Delhi',
      areas: [
        { area: 'Jasola', pincode: '110025', buildings_cover: ['Jasola apartment clusters'] },
        { area: 'Sarita Vihar', pincode: '110076', buildings_cover: ['Sarita Vihar residential'] },
        { area: 'Kalkaji', pincode: '110019', buildings_cover: ['Kalkaji residential'] },
        { area: 'Okhla', pincode: '110025', buildings_cover: ['Okhla residential clusters'] },
      ],
      zone_center: { latitude: 28.535, longitude: 77.285 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Delhi',
    region: 'NCR_CENTRAL',
    zone: {
      id: 'DEL_D3',
      name: 'Dwarka',
      areas: [
        {
          area: 'Dwarka Sector 1-6',
          pincode: '110075',
          buildings_cover: ['Dwarka residential societies'],
        },
        {
          area: 'Dwarka Sector 10-14',
          pincode: '110075',
          buildings_cover: ['Dwarka apartment clusters'],
        },
        {
          area: 'Dwarka Sector 17-22',
          pincode: '110075',
          buildings_cover: ['Dwarka residential societies'],
        },
      ],
      zone_center: { latitude: 28.592, longitude: 77.046 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Delhi',
    region: 'NCR_CENTRAL',
    zone: {
      id: 'DEL_D4',
      name: 'West Delhi',
      areas: [
        { area: 'Janakpuri', pincode: '110058', buildings_cover: ['Janakpuri residential'] },
        { area: 'Vikaspuri', pincode: '110018', buildings_cover: ['Vikaspuri residential'] },
        { area: 'Paschim Vihar', pincode: '110063', buildings_cover: ['Paschim Vihar societies'] },
        { area: 'Rajouri Garden', pincode: '110027', buildings_cover: ['Rajouri Garden residential'] },
      ],
      zone_center: { latitude: 28.63, longitude: 77.08 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Delhi',
    region: 'NCR_CENTRAL',
    zone: {
      id: 'DEL_D5',
      name: 'North West Delhi',
      areas: [
        { area: 'Rohini', pincode: '110085', buildings_cover: ['Rohini sectors', 'Residential societies'] },
        { area: 'Pitampura', pincode: '110034', buildings_cover: ['Pitampura residential'] },
        { area: 'Prashant Vihar', pincode: '110085', buildings_cover: ['Prashant Vihar residential'] },
      ],
      zone_center: { latitude: 28.7, longitude: 77.11 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Delhi',
    region: 'NCR_CENTRAL',
    zone: {
      id: 'DEL_D6',
      name: 'East Delhi',
      areas: [
        {
          area: 'Mayur Vihar',
          pincode: '110091',
          buildings_cover: ['Mayur Vihar Phase 1', 'Mayur Vihar Phase 2', 'Mayur Vihar Phase 3'],
        },
        { area: 'Patparganj', pincode: '110092', buildings_cover: ['Patparganj apartment societies'] },
        { area: 'IP Extension', pincode: '110092', buildings_cover: ['IP Extension societies'] },
        { area: 'Preet Vihar', pincode: '110092', buildings_cover: ['Preet Vihar residential'] },
      ],
      zone_center: { latitude: 28.62, longitude: 77.295 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Gurugram',
    region: 'NCR_SOUTH',
    zone: {
      id: 'GGN_G1',
      name: 'Golf Course Road',
      areas: [
        {
          area: 'Sector 42-44',
          pincode: '122002',
          buildings_cover: ['DLF residential clusters', 'Sector 42', 'Sector 43', 'Sector 44'],
        },
        {
          area: 'Sector 53-56',
          pincode: '122011',
          buildings_cover: ['Golf Course Road societies', 'Sector 54', 'Sector 55', 'Sector 56'],
        },
      ],
      zone_center: { latitude: 28.45, longitude: 77.095 },
      service_radius_km: 3,
    },
  },
  {
    city: 'Gurugram',
    region: 'NCR_SOUTH',
    zone: {
      id: 'GGN_G2',
      name: 'Golf Course Extension',
      areas: [
        {
          area: 'Sector 58-62',
          pincode: '122011',
          buildings_cover: [
            'Sector 58 societies',
            'Sector 59 societies',
            'Sector 60 societies',
            'Sector 61 societies',
            'Sector 62 societies',
          ],
        },
        {
          area: 'Sector 63-67',
          pincode: '122001',
          buildings_cover: ['Sector 63', 'Sector 63A', 'Sector 64', 'Sector 65', 'Sector 66', 'Sector 67'],
        },
      ],
      zone_center: { latitude: 28.41, longitude: 77.08 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Gurugram',
    region: 'NCR_SOUTH',
    zone: {
      id: 'GGN_G3',
      name: 'New Gurgaon',
      areas: [
        {
          area: 'Sector 80-84',
          pincode: '122004',
          buildings_cover: ['New Gurgaon societies', 'Sector 80-84 residential'],
        },
        {
          area: 'Sector 85-90',
          pincode: '122004',
          buildings_cover: ['New Gurgaon apartment clusters'],
        },
        {
          area: 'Sector 91-95',
          pincode: '122505',
          buildings_cover: ['New Gurgaon residential projects'],
        },
      ],
      zone_center: { latitude: 28.39, longitude: 76.98 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Gurugram',
    region: 'NCR_SOUTH',
    zone: {
      id: 'GGN_G4',
      name: 'Dwarka Expressway',
      areas: [
        {
          area: 'Sector 102-106',
          pincode: '122006',
          buildings_cover: ['Dwarka Expressway societies'],
        },
        {
          area: 'Sector 107-113',
          pincode: '122017',
          buildings_cover: ['Dwarka Expressway apartment clusters'],
        },
      ],
      zone_center: { latitude: 28.493, longitude: 76.99 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Gurugram',
    region: 'NCR_SOUTH',
    zone: {
      id: 'GGN_G5',
      name: 'Sohna Road',
      areas: [
        {
          area: 'Sector 47-49',
          pincode: '122018',
          buildings_cover: ['Sector 47 societies', 'Sector 48 societies', 'Sector 49 societies'],
        },
        {
          area: 'Sector 67-72',
          pincode: '122018',
          buildings_cover: ['Sohna Road residential', 'Sector 70A', 'Sector 71', 'Sector 72'],
        },
      ],
      zone_center: { latitude: 28.39, longitude: 77.04 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Faridabad',
    region: 'NCR_SOUTH_EAST',
    zone: {
      id: 'FBD_F1',
      name: 'Central Faridabad',
      areas: [
        {
          area: 'Sector 14-19',
          pincode: '121007',
          buildings_cover: ['Sector 14', 'Sector 15', 'Sector 16', 'Sector 17', 'Sector 18', 'Sector 19'],
        },
      ],
      zone_center: { latitude: 28.42, longitude: 77.31 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Faridabad',
    region: 'NCR_SOUTH_EAST',
    zone: {
      id: 'FBD_F2',
      name: 'Greater Faridabad',
      areas: [
        {
          area: 'Sector 75-82',
          pincode: '121004',
          buildings_cover: ['Greater Faridabad societies', 'High-rise apartment clusters'],
        },
        {
          area: 'Sector 85-89',
          pincode: '121002',
          buildings_cover: ['Neharpar residential'],
        },
      ],
      zone_center: { latitude: 28.41, longitude: 77.36 },
      service_radius_km: 4,
    },
  },
  {
    city: 'Sonipat',
    region: 'NCR_NORTH',
    zone: {
      id: 'SNP_S1',
      name: 'Sonipat Urban',
      areas: [
        {
          area: 'Sector 12-15',
          pincode: '131001',
          buildings_cover: ['Sector 12', 'Sector 14', 'Sector 15'],
        },
        { area: 'Sector 23', pincode: '131001', buildings_cover: ['Sector 23 residential'] },
      ],
      zone_center: { latitude: 28.995, longitude: 77.02 },
      service_radius_km: 5,
    },
  },
  {
    city: 'Sonipat',
    region: 'NCR_NORTH',
    zone: {
      id: 'SNP_S2',
      name: 'Kundli',
      areas: [
        {
          area: 'Kundli',
          pincode: '131028',
          buildings_cover: ['Kundli residential societies', 'Apartment clusters'],
        },
      ],
      zone_center: { latitude: 28.877, longitude: 77.115 },
      service_radius_km: 5,
    },
  },
  {
    city: 'Bahadurgarh',
    region: 'NCR_WEST',
    zone: {
      id: 'BHD_B1',
      name: 'Bahadurgarh Urban',
      areas: [
        {
          area: 'Sector 2-10',
          pincode: '124507',
          buildings_cover: ['Sector 2', 'Sector 6', 'Sector 9', 'Sector 10', 'Residential societies'],
        },
      ],
      zone_center: { latitude: 28.69, longitude: 76.93 },
      service_radius_km: 5,
    },
  },
];
