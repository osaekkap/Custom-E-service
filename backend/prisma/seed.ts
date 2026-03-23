import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });
const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
);

async function main() {
  const email = 'admin@customs-edoc.local';
  const password = 'Admin1234!';
  const fullName = 'Super Admin';

  console.log('🌱 Seeding Super Admin...');

  // 1. Create Supabase Auth user (or get existing)
  const { data: listData } = await supabase.auth.admin.listUsers();
  let supabaseUser = listData?.users?.find((u) => u.email === email);

  if (!supabaseUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw new Error(`Supabase createUser failed: ${error.message}`);
    supabaseUser = data.user;
    console.log('✅ Supabase Auth user created:', supabaseUser.id);
  } else {
    console.log('ℹ️  Supabase Auth user already exists:', supabaseUser.id);
  }

  // 2. Upsert Profile (no CustomerUser → SUPER_ADMIN by default)
  await prisma.profile.upsert({
    where: { id: supabaseUser.id },
    create: { id: supabaseUser.id, email, fullName },
    update: { fullName },
  });
  console.log('✅ Profile upserted');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────');
  console.log(`Email   : ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role    : SUPER_ADMIN`);
  console.log('─────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
