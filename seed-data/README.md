# Seed Data (Mongo Extended JSON)

Collection files created for all project tables:

- categories.json
- symptoms.json
- medicines.json
- medicine_symptoms.json
- illness_episodes.json
- episode_symptoms.json
- episode_medicines.json
- episode_doses.json
- blogs.json
- blog_symptoms.json
- usage_logs.json

## File -> Collection Mapping (Important)
- `categories.json` -> `categories`
- `symptoms.json` -> `symptoms`
- `medicines.json` -> `medicines`
- `medicine_symptoms.json` -> `medicinesymptoms`
- `blogs.json` -> `blogs`
- `blog_symptoms.json` -> `blogsymptoms`
- `illness_episodes.json` -> `illnessepisodes`
- `episode_symptoms.json` -> `episodesymptoms`
- `episode_medicines.json` -> `episodemedicines`
- `episode_doses.json` -> `episodedoses`
- `usage_logs.json` -> `usagelogs`

## Import Order
1. categories
2. symptoms
3. medicines
4. medicinesymptoms
5. blogs
6. blogsymptoms
7. illnessepisodes
8. episodesymptoms
9. episodemedicines
10. episodedoses
11. usagelogs

## Example (Windows PowerShell)

```powershell
mongoimport --uri "$env:MONGODB_URI" --db MediTrack --collection categories --jsonArray --file seed-data/categories.json
```

Repeat for each file using the mapping above.

## Notes
- Files use Mongo Extended JSON (`$oid`, `$date`).
- ObjectId references are pre-linked across collections.
- Includes one recovered episode and one ongoing episode as starter state.
