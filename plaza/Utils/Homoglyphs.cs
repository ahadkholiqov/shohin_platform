namespace plaza.Utils
{
    public static class Homoglyphs
    {
        public static string NormalizeToCyrillic(string value)
        {
            return value
                .Replace('A', 'А').Replace('a', 'а')
                .Replace('B', 'В').Replace('b', 'в')
                .Replace('C', 'С').Replace('c', 'с')
                .Replace('E', 'Е').Replace('e', 'е')
                .Replace('H', 'Н').Replace('h', 'н')
                .Replace('M', 'М').Replace('m', 'м')
                .Replace('O', 'О').Replace('o', 'о')
                .Replace('P', 'Р').Replace('p', 'р')
                .Replace('T', 'Т').Replace('t', 'т')
                .Replace('X', 'Х').Replace('x', 'х')
                .Replace('Y', 'У').Replace('y', 'у');
        }
    }
}
