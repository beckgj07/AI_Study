const { PrismaClient } = require('../src/generated/prisma');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'study.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 创建科目
  const subjects = [
    { id: 'math', name: '数学', icon: '📐', isPreset: true, isRequired: true, order: 1 },
    { id: 'chinese', name: '语文', icon: '📜', isPreset: true, isRequired: true, order: 2 },
    { id: 'english', name: '英语', icon: '📖', isPreset: true, isRequired: true, order: 3 },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { id: subject.id },
      update: subject,
      create: subject,
    });
    console.log(`Created subject: ${subject.name}`);
  }

  // 创建教材版本
  const versions = [
    { id: 'pep', name: '人教版', publisher: '人民教育出版社' },
    { id: 'bsd', name: '北师大版', publisher: '北京师范大学出版社' },
    { id: 'jxsj', name: '沪教版', publisher: '上海教育出版社' },
  ];

  for (const version of versions) {
    await prisma.textbookVersion.upsert({
      where: { id: version.id },
      update: version,
      create: { ...version, subjectId: 'math' }, // 默认关联数学
    });
    console.log(`Created version: ${version.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
