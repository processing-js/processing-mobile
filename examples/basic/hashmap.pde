HashMap hm = new HashMap();

hm.put("Ava", 1);
hm.put("Cait", 35);
hm.put("Casey", 36);

Iterator i = hm.entrySet().iterator();  // Get an iterator

while (i.hasNext()) {
  Map.Entry me = (Map.Entry)i.next();
  print(me.getKey() + " is ");
  println(me.getValue());
}
