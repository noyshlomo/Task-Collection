import datetime

'''
To handle data that comes from a stream, 
I'll use a dictionary where the key is the hour, 
and the value is a tuple consisting of the sum of values seen during this hour 
and the count of times we've seen data for this hour.
With every new piece of data, we'll update the dictionary. 
When returning the result, 
we'll calculate the hourly average by dividing the sum of values by the count of occurrences for each hour.
'''
class HourlyAveragesStream:
    def __init__(self):
        self.hourly_data = {}

    def update(self, timestamp_str, value_str):
        try:
            timestamp = datetime.datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
            hour_key = timestamp.strftime('%H')

            value = float(value_str)

            if hour_key in self.hourly_data:
                sum_values, count = self.hourly_data[hour_key]
                self.hourly_data[hour_key] = (sum_values + value, count + 1)
            else:
                self.hourly_data[hour_key] = (value, 1)
        
        except (ValueError, TypeError) as e:
            print(f"Error processing data: {e}")

    def get_hourly_averages(self):
        averages = {}
        for hour, (sum_values, count) in self.hourly_data.items():
            averages[hour] = sum_values / count
        return averages

#test
stream_handler = HourlyAveragesStream()

data_stream = [
    ('2025-06-10 06:00:00', '7.9'),
    ('2025-06-10 07:00:00', '3'),
    ('2025-06-10 06:30:00', '8.2'),
    ('2025-06-10 07:15:00', '4.1')
]

for timestamp, value in data_stream:
    stream_handler.update(timestamp, value)

averages = stream_handler.get_hourly_averages()
for hour, avg in sorted(averages.items()):
    print(f"Hour {hour}: {avg:.2f}")
