import slugify from 'slugify';

export const generateSlug = (value: string) => {
  const slug = slugify(value, { lower: true });
  return slug;
};
