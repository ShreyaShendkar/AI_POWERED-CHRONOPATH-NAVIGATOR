import sys
if hasattr(sys.stdout,'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')
import urllib.request, json

BASE = 'http://localhost:8001'

def post(path, body):
    data = json.dumps(body).encode()
    req  = urllib.request.Request(f'{BASE}{path}', data=data,
                                   headers={'Content-Type':'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=8) as r:
        return json.loads(r.read())

def get(path):
    with urllib.request.urlopen(f'{BASE}{path}', timeout=8) as r:
        return json.loads(r.read())

print('=== HEALTH ===')
h = get('/api/health')
print('Status:', h['status'], '| Models:', len(h['models_loaded']))

print('\n=== PERSONA (guest) ===')
p = post('/api/persona/detect', {'user_id': None})
print(json.dumps(p, indent=2))

print('\n=== ROUTE RECOMMEND ===')
r = post('/api/route/recommend', {
    'persona_label': 'Heritage Scholar',
    'group_type': 'solo', 'time_available_h': 3.5,
    'budget_tier': 'mid', 'interests': ['heritage','photography'], 'top_n': 3
})
for rec in r['recommendations']:
    print(f"  {rec['emoji']} {rec['name']:<35} score={rec['hybrid_score']} time={rec['avg_time_h']}h")

print('\n=== TIME PREDICTION ===')
t = post('/api/time/predict', {
    'stops_count':4,'total_distance_km':8.0,'time_estimated_h':3.5,
    'hour_of_day':10,'day_of_week':6,'month':10,'audio_plays':3,
    'photos_taken':5,'avg_time_available':4.0,'visit_count':2,'badges_earned':3,
    'route_type':'heritage','weather_condition':'sunny','traffic_level':'low',
    'group_type':'solo','budget_tier':'mid','tourist_type':'domestic','season':'winter',
    'is_weekend':1,'is_festival_season':0,'history_layer_used':1,'history_layer_on':1
})
print(json.dumps(t, indent=2))

print('\n=== CROWD PREDICTION ===')
c = post('/api/crowd/predict', {
    'stop_id':'kasba_ganpati','hour':11,'day_of_week':6,'month':10,
    'is_weekend':1,'is_festival_season':0,'weather':'sunny','tourist_type':'local'
})
print(json.dumps(c, indent=2))

print('\n=== FOOD RECOMMEND ===')
f = post('/api/food/recommend', {
    'user_id': None, 'is_veg': True, 'budget_max_inr': 300,
    'time_of_day': 'lunch', 'top_n': 4
})
for rec in f['recommendations']:
    print(f"  {rec['name']:<35} score={rec['hybrid_score']} cost=Rs{rec['avg_cost_inr']}")

print('\n[OK] All 5 ML endpoints tested successfully!')
