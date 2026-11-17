#!/usr/bin/env bash
# Workspace settings for the NGF demo that neither app owns. Safe to rerun.
# Usage: scripts/configure-workspace.sh [remote]   (default: fundraising-local)
set -euo pipefail

REMOTE="${1:-fundraising-local}"

gql() { twenty api graphql --remote "$REMOTE" --no-input "$@" 2>/dev/null; }
metadata() { gql --metadata --query "$1"; }

application_id() {
  metadata '{ findManyApplications { id universalIdentifier } }' |
    python3 -c "import json,sys; print(next(a['id'] for a in json.load(sys.stdin)['findManyApplications'] if a['universalIdentifier']=='$1'))"
}

field_id() {
  twenty metadata field describe "$1" "$2" --remote "$REMOTE" --no-input 2>/dev/null | awk '/^ID/ {print $2}'
}

echo "Turning off Gift Aid in Fundraising for Twenty"
FUNDRAISING_ID=$(application_id 65b22a2e-4982-4102-a625-aeaaf9cb0409)
metadata "mutation { updateOneApplicationVariable(key: \"GIFT_AID_ENABLED\", value: \"false\", applicationId: \"$FUNDRAISING_ID\") }" >/dev/null

echo "Relabelling opportunity stages as a cultivation cycle"
STAGE_ID=$(field_id opportunity stage)
metadata "mutation { updateOneField(input: { id: \"$STAGE_ID\", update: { options: [
  { id: \"20202020-8e01-4afd-9c39-d2063097587a\", value: \"NEW\", label: \"Identification\", position: 0, color: \"gray\" },
  { id: \"20202020-e685-4671-ac32-26d304dacb6e\", value: \"SCREENING\", label: \"Qualification\", position: 1, color: \"sky\" },
  { id: \"20202020-dde9-4acc-b5ca-f6531a8ecb4a\", value: \"MEETING\", label: \"Cultivation\", position: 2, color: \"blue\" },
  { id: \"20202020-696e-4f6b-91bc-f413e9b2f654\", value: \"PROPOSAL\", label: \"Solicitation\", position: 3, color: \"purple\" },
  { id: \"20202020-0bb5-4a6f-a8b2-774bbad21104\", value: \"CUSTOMER\", label: \"Pledged / Won\", position: 4, color: \"green\" },
  { id: \"6a2d8f0e-5b1c-4c7e-9f3a-2d4b6e8a1c50\", value: \"STEWARDSHIP\", label: \"Stewardship\", position: 5, color: \"turquoise\" },
  { id: \"9c4e1a7b-3d2f-4b8e-a6c5-7e1f3b9d2a64\", value: \"DECLINED\", label: \"Declined\", position: 6, color: \"red\" }
] } }) { id } }" >/dev/null

echo "Renaming Companies to Organisations"
COMPANY_ID=$(metadata '{ objects(paging: { first: 200 }, filter: {}) { edges { node { id nameSingular } } } }' |
  python3 -c "import json,sys; print(next(e['node']['id'] for e in json.load(sys.stdin)['objects']['edges'] if e['node']['nameSingular']=='company'))")
metadata "mutation { updateOneObject(input: { id: \"$COMPANY_ID\", update: { labelSingular: \"Organisation\", labelPlural: \"Organisations\", icon: \"IconBuildingCommunity\" } }) { id } }" >/dev/null

echo "Arranging the sidebar"
REMOTE="$REMOTE" python3 - <<'PYTHON'
import json, os, subprocess

remote = os.environ['REMOTE']

def metadata(query):
    out = subprocess.run(['twenty', 'api', 'graphql', '--metadata', '--remote', remote, '--no-input', '--query', query],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)

applications = {a['universalIdentifier']: a['id'] for a in metadata('{ findManyApplications { id universalIdentifier } }')['findManyApplications']}
STANDARD = applications['20202020-64aa-4b6f-b003-9c74b97cee20']
FUNDRAISING = applications['65b22a2e-4982-4102-a625-aeaaf9cb0409']
NGF = applications['0da875a7-b64f-4599-8f03-991487d83643']

objects = {e['node']['id']: e['node']['nameSingular'] for e in
           metadata('{ objects(paging: { first: 200 }, filter: {}) { edges { node { id nameSingular } } } }')['objects']['edges']}
items = [i for i in metadata('{ navigationMenuItems { id name type position folderId applicationId targetObjectMetadataId userWorkspaceId } }')['navigationMenuItems']
         if not i['userWorkspaceId']]

def find(application, *, name=None, obj=None, kind=None):
    for item in items:
        if item['applicationId'] != application or (kind and item['type'] != kind):
            continue
        if name and (item['name'] or '').startswith(name):
            return item
        if obj and objects.get(item['targetObjectMetadataId']) == obj:
            return item
    return None

folders = {item['name']: item['id'] for item in items if item['applicationId'] == NGF and item['type'] == 'FOLDER'}

# (item, folder name or None for top level, position)
placement = [
    (find(STANDARD, obj='person', kind='OBJECT'), None, 1),
    (find(STANDARD, obj='company', kind='OBJECT'), None, 2),
    (find(STANDARD, obj='opportunity', kind='OBJECT'), 'Fundraising', 20),
    (find(FUNDRAISING, name='gifts-navigation'), 'Fundraising', 30),
    (find(FUNDRAISING, name='appeals-navigation'), 'Fundraising', 40),
    (find(FUNDRAISING, name='appeal-sources-navigation'), 'Fundraising', 50),
    (find(FUNDRAISING, name='funds-navigation'), 'Fundraising', 60),
    (find(FUNDRAISING, name='recurring-agreements-navigation'), 'Fundraising', 70),
    (find(FUNDRAISING, name='donation-forms-navigation'), 'Fundraising', 80),
    (find(FUNDRAISING, name='gift-batches-navigation'), 'Gift processing', 10),
    (find(FUNDRAISING, name='gift-stagings'), 'Gift processing', 20),
    (find(STANDARD, name='Campaigns', kind='FOLDER'), None, 50),
    (find(STANDARD, obj='task', kind='OBJECT'), None, 60),
    (find(STANDARD, obj='note', kind='OBJECT'), None, 61),
    (find(STANDARD, obj='dashboard', kind='OBJECT'), None, 62),
    (find(STANDARD, name='Workflows', kind='FOLDER'), None, 70),
]
updates = [{'id': item['id'], 'update': {'folderId': folders[folder] if folder else None, 'position': position}}
           for item, folder, position in placement if item]
metadata('mutation { updateManyNavigationMenuItems(inputs: ' + json.dumps(updates).replace('"id"', 'id').replace('"update"', 'update')
         .replace('"folderId"', 'folderId').replace('"position"', 'position') + ') { id } }')
print(f'  placed {len(updates)} items')

hidden = [find(FUNDRAISING, name='gift-aid-claim-batches'), find(STANDARD, name='Star History')]
hidden_ids = [item['id'] for item in hidden if item]
if hidden_ids:
    metadata('mutation { deleteManyNavigationMenuItems(ids: ' + json.dumps(hidden_ids) + ') { id } }')
print(f'  removed {len(hidden_ids)} items')

# GIFT_AID_ENABLED only gates the New gift panel, so hide the remaining Gift Aid tab and widget.
layouts = metadata('{ getPageLayouts { name tabs { id title widgets { id title } } } }')['getPageLayouts']
removed = 0
for layout in layouts:
    for tab in layout['tabs'] or []:
        if layout['name'] == 'Gift Record Page' and tab['title'] == 'Gift Aid':
            metadata(f'mutation {{ destroyPageLayoutTab(id: "{tab["id"]}") }}')
            removed += 1
            continue
        for widget in tab['widgets'] or []:
            if layout['name'] == 'Default Person Layout' and widget['title'] == 'Gift Aid declarations':
                metadata(f'mutation {{ destroyPageLayoutWidget(id: "{widget["id"]}") }}')
                removed += 1
print(f'  hid {removed} Gift Aid tabs and widgets')
PYTHON

echo "Done"
