// src/data/mockData.js — Revamped (only nav links, footer links, and shared data)

export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop All', path: '/collections' },
  { label: 'Designer Blouses', path: '/category/apparel/designer-blouses' },
  { label: 'Jewellery', path: '/category/jewellery' },
  { label: 'About', path: '/about' },
];

export const footerLinks = {
  informations: [
    { label: 'Shipping Policy', path: '/shipping-policy' },
    { label: 'Return Policy', path: '#' },
    { label: 'Help', path: '#' },
    { label: 'Privacy Policy', path: '#' },
    { label: 'Blogs', path: '/blogs' },
  ],
  account: [
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'My account', path: '/account' },
    { label: 'My orders', path: '/account' },
    { label: 'Wishlist', path: '/wishlist' },
  ],
  about: [
    { label: 'About Us', path: '/about' }
  ]
};
