import os

migration_file = "alembic/versions/61b85a984713_add_user_and_user_id.py"

with open(migration_file, "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if "op.create_table('users'" in line:
        new_lines.append(line)
        continue
        
    if "add_column(sa.Column('user_id'" in line:
        line = line.replace("nullable=False", "server_default='1', nullable=False")
        
    new_lines.append(line)

# Let's also inject the user creation right after users table is created.
# We will insert it after: batch_op.create_index(batch_op.f('ix_users_id'), ['id'], unique=False)
final_lines = []
in_users_batch = False
for line in new_lines:
    final_lines.append(line)
    if "batch_op.create_index(batch_op.f('ix_users_id')" in line:
        final_lines.append("""
    # Insert default user
    op.execute("INSERT INTO users (email, hashed_password) VALUES ('admin@example.com', '$2b$12$H67SppBtwPi6mpmT7lbXfua6XoeO5p/Qb.E79boX/ZT4sjBPB8h9m')")
""")

with open(migration_file, "w") as f:
    f.write("".join(final_lines))

print("Migration updated successfully.")
