namespace plaza.Utils
{
    public static class Homoglyphs
    {
        // Apartment numbers are entered in Russian, but managers often switch keyboard
        // layouts and type Latin look-alike letters (e.g. Latin "A-301" vs Cyrillic
        // "А-301"). Normalizing Latin look-alikes to their Cyrillic equivalents makes
        // such mix-ups collapse to the same value, so the unique (Block, Number) index
        // correctly rejects duplicates.
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
